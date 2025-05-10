<script lang="ts" setup>
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type StyleValue,
} from "vue";
import { type DragResizeProps, type Sticks } from "./props";
import { styleMapping } from "./constants";

defineOptions({
  name: "DragResize",
});

const props = withDefaults(defineProps<DragResizeProps>(), {
  stickSize: 8,
  showStick: true,
  parentScaleX: 1,
  parentScaleY: 1,
  isActive: false,
  preventActiveBehavior: false,
  isDraggable: true,
  isResizable: true,
  aspectRatio: false,
  snapToGrid: false,
  gridX: 50,
  gridY: 50,
  parentH: 0,
  parentW: 0,
  w: 200,
  h: 200,
  minh: 50,
  minw: 50,
  x: 0,
  y: 0,
  z: "auto",
  dragHandle: null,
  dragCancel: null,
  sticks: () => ["tl", "tm", "tr", "mr", "br", "bm", "bl", "ml"],
  axis: "both",
  contentClass: "",
});

const emits = defineEmits([
  "clicked",
  "dragging",
  "dragstop",
  "resizing",
  "resizestop",
  "activated",
  "deactivated",
]);

const instance = getCurrentInstance();

const container = ref<HTMLDivElement>();

const parentWidth = ref<number>(0);
const parentHeight = ref<number>(0);
const stickDrag = ref(false);
const bodyDrag = ref(false);
const dimensionsBeforeMove = ref<Record<string, number>>({
  pointerX: 0,
  pointerY: 0,
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  height: 0,
  width: 0,
});
const limits = ref<Record<string, { min: number | null; max: number | null }>>({
  left: { min: null, max: null },
  right: { min: null, max: null },
  top: { min: null, max: null },
  bottom: { min: null, max: null },
});
const currentStick = ref<Sticks>("bl");
const aspectFactor = ref(0);
const parentElement = ref<HTMLElement>();
const left = ref(props?.x);
const right = ref();
const top = ref(props?.y);
const bottom = ref(0);
const domEvents = ref(
  new Map([
    ["mousemove", move],
    ["mouseup", up],
    ["mouseleave", up],
    ["mousedown", deselect],
    ["touchmove", move],
    ["touchend", up],
    ["touchcancel", up],
    ["touchstart", up],
  ])
);
const zIndex = ref<string | number>(0);
const active = ref(false);

const minHeight = ref(0);

const minWidth = ref(0);

const width = computed(() => {
  return parentWidth.value - left.value - right.value;
});

const height = computed(() => {
  return parentHeight.value - top.value - bottom.value;
});

const rect = computed(() => {
  return {
    left: Math.round(left.value),
    top: Math.round(top.value),
    width: Math.round(width.value),
    height: Math.round(height.value),
  };
});

const positionStyle = computed(() => {
  return {
    top: top.value + "px",
    left: left.value + "px",
    zIndex: Number(zIndex.value),
  } as StyleValue;
});

const sizeStyle = computed(() => {
  return {
    width: props?.w == "auto" ? "auto" : width.value + "px",
    height: props?.h == "auto" ? "auto" : height.value + "px",
  };
});

onMounted(() => {
  parentElement.value = instance?.parent?.proxy?.$el! as HTMLElement;
  parentWidth.value = props?.parentW
    ? props?.parentW
    : parentElement.value?.clientWidth;
  parentHeight.value = props?.parentH
    ? props?.parentH
    : parentElement.value?.clientHeight;

  left.value = props?.x;
  top.value = props?.y;
  right.value =
    parentWidth.value -
    (props?.w === "auto"
      ? Number(container.value?.scrollWidth)
      : Number(props?.w!)) -
    left.value;
  bottom.value =
    parentHeight.value -
    (props?.h === "auto"
      ? Number(container.value?.scrollHeight)
      : Number(props?.h)) -
    top.value;

  addEvents(domEvents.value as Map<string, EventListener>);

  if (props?.dragHandle) {
    [...instance?.proxy?.$el.querySelectorAll(props?.dragHandle)].forEach(
      (dragHandle) => {
        dragHandle.setAttribute("data-drag-handle", instance?.uid);
      }
    );
  }

  if (props?.dragCancel) {
    [...instance?.proxy?.$el.querySelectorAll(props?.dragCancel)].forEach(
      (cancelHandle) => {
        cancelHandle.setAttribute("data-drag-cancel", instance?.uid);
      }
    );
  }
});

onBeforeUnmount(() => {
  removeEvents(domEvents.value as Map<string, EventListener>);
});

function deselect() {
  if (props?.preventActiveBehavior) {
    return;
  }
  active.value = false;
}

function drStick(stick: Sticks) {
  const stickStyle: Record<string, string> = {
    width: `${props.stickSize / props.parentScaleX}px`,
    height: `${props.stickSize / props.parentScaleY}px`,
  };
  stickStyle[styleMapping.y[stick[0]]] = `${
    props.stickSize / props.parentScaleX / -2
  }px`;
  stickStyle[styleMapping.x[stick[1]]] = `${
    props.stickSize / props.parentScaleX / -2
  }px`;
  return stickStyle;
}

function stickSizeStyle() {
  return {
    width: `${props.stickSize / props.parentScaleX}px`,
    height: `${props.stickSize / props.parentScaleY}px`,
  };
}

function move(ev: TouchEvent & DragEvent) {
  if (!stickDrag.value && !bodyDrag.value) {
    return;
  }

  ev.stopPropagation();

  const pageX =
    typeof ev.pageX !== "undefined" ? ev.pageX : ev.touches[0].pageX;
  const pageY =
    typeof ev.pageY !== "undefined" ? ev.pageY : ev.touches[0].pageY;

  const delta = {
    x: (dimensionsBeforeMove.value.pointerX - pageX) / props.parentScaleX,
    y: (dimensionsBeforeMove.value.pointerY - pageY) / props.parentScaleY,
  };

  if (stickDrag.value) {
    stickMove(delta);
  }

  if (bodyDrag.value) {
    if (props?.axis === "x") {
      delta.y = 0;
    } else if (props.axis === "y") {
      delta.x = 0;
    } else if (props.axis === "none") {
      return;
    }
    bodyMove(delta);
  }
}

function up() {
  if (stickDrag.value) {
    stickUp();
  } else if (bodyDrag.value) {
    bodyUp();
  }
}

function bodyUp() {
  bodyDrag.value = false;
  emits("dragging", rect.value);
  emits("dragstop", rect.value);

  dimensionsBeforeMove.value = {
    pointerX: 0,
    pointerY: 0,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  };

  limits.value = {
    left: { min: null, max: null },
    right: { min: null, max: null },
    top: { min: null, max: null },
    bottom: { min: null, max: null },
  };
}

function stickUp() {
  stickDrag.value = false;
  dimensionsBeforeMove.value = {
    pointerX: 0,
    pointerY: 0,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  };
  limits.value = {
    left: { min: null, max: null },
    right: { min: null, max: null },
    top: { min: null, max: null },
    bottom: { min: null, max: null },
  };

  emits("resizing", rect.value);
  emits("resizestop", rect.value);
}

function stickMove(delta: { x: number; y: number }) {
  let newTop = dimensionsBeforeMove.value.top;
  let newBottom = dimensionsBeforeMove.value.bottom;
  let newLeft = dimensionsBeforeMove.value.left;
  let newRight = dimensionsBeforeMove.value.right;
  switch (currentStick.value[0]) {
    case "b":
      newBottom = dimensionsBeforeMove.value.bottom + delta.y;

      if (props?.snapToGrid) {
        newBottom =
          parentHeight.value -
          Math.round((parentHeight.value - newBottom) / props?.gridY) *
            props?.gridY;
      }

      break;

    case "t":
      newTop = dimensionsBeforeMove.value.top - delta.y;

      if (props?.snapToGrid) {
        newTop = Math.round(newTop / props?.gridY) * props?.gridY;
      }

      break;
    default:
      break;
  }

  switch (currentStick.value[1]) {
    case "r":
      newRight = dimensionsBeforeMove.value.right + delta.x;

      if (props?.snapToGrid) {
        newRight =
          parentWidth.value -
          Math.round((parentWidth.value - newRight) / props?.gridX) *
            props?.gridX;
      }

      break;

    case "l":
      newLeft = dimensionsBeforeMove.value.left - delta.x;

      if (props?.snapToGrid) {
        newLeft = Math.round(newLeft / props?.gridX) * props?.gridX;
      }

      break;
    default:
      break;
  }

  ({ newLeft, newRight, newTop, newBottom } = rectCorrectionByLimit({
    newLeft,
    newRight,
    newTop,
    newBottom,
  }));

  if (props?.aspectRatio) {
    ({ newLeft, newRight, newTop, newBottom } = rectCorrectionByAspectRatio({
      newLeft,
      newRight,
      newTop,
      newBottom,
    }));
  }

  left.value = newLeft;
  right.value = newRight;
  top.value = newTop;
  bottom.value = newBottom;

  emits("resizing", rect);
}

function rectCorrectionByLimit(rect: Record<string, number>) {
  let { newRight, newLeft, newBottom, newTop } = rect;

  newLeft = sideCorrectionByLimit(limits.value.left, newLeft);
  newRight = sideCorrectionByLimit(limits.value.right, newRight);
  newTop = sideCorrectionByLimit(limits.value.top, newTop);
  newBottom = sideCorrectionByLimit(limits.value.bottom, newBottom);

  return {
    newLeft,
    newRight,
    newTop,
    newBottom,
  };
}

function sideCorrectionByLimit(
  limit: { min: number | null; max: number | null },
  current: number
) {
  let value = current;

  if (limit.min !== null && current < limit.min) {
    value = limit.min;
  } else if (limit.max !== null && limit.max < current) {
    value = limit.max;
  }

  return value;
}

function rectCorrectionByAspectRatio(rect: Record<string, number>) {
  let { newLeft, newRight, newTop, newBottom } = rect;

  let newWidth = parentWidth.value - newLeft - newRight;
  let newHeight = parentHeight.value - newTop - newBottom;

  if (currentStick.value[1] === "m") {
    const deltaHeight = newHeight - dimensionsBeforeMove.value.height;

    newLeft -= (deltaHeight * aspectFactor.value) / 2;
    newRight -= (deltaHeight * aspectFactor.value) / 2;
  } else if (currentStick.value[0] === "m") {
    const deltaWidth = newWidth - dimensionsBeforeMove.value.width;

    newTop -= deltaWidth / aspectFactor.value / 2;
    newBottom -= deltaWidth / aspectFactor.value / 2;
  } else if (newWidth / newHeight > aspectFactor.value) {
    newWidth = aspectFactor.value * newHeight;

    if (currentStick.value[1] === "l") {
      newLeft = parentWidth.value - newRight - newWidth;
    } else {
      newRight = parentWidth.value - newLeft - newWidth;
    }
  } else {
    newHeight = newWidth / aspectFactor.value;

    if (currentStick.value[0] === "t") {
      newTop = parentHeight.value - newBottom - newHeight;
    } else {
      newBottom = parentHeight.value - newTop - newHeight;
    }
  }

  return { newLeft, newRight, newTop, newBottom };
}

function bodyMove(delta: { x: number; y: number }) {
  let newTop = dimensionsBeforeMove.value.top - delta.y;
  let newBottom = dimensionsBeforeMove.value.bottom + delta.y;
  let newLeft = dimensionsBeforeMove.value.left - delta.x;
  let newRight = dimensionsBeforeMove.value.right + delta.x;

  if (props.snapToGrid) {
    let alignTop = true;
    let alignLeft = true;

    let diffT = newTop - Math.floor(newTop / props?.gridY) * props?.gridY;
    let diffB =
      parentHeight.value -
      newBottom -
      Math.floor((parentHeight.value - newBottom) / props?.gridY) *
        props?.gridY;
    let diffL = newLeft - Math.floor(newLeft / props?.gridX) * props?.gridX;
    let diffR =
      parentWidth.value -
      newRight -
      Math.floor((parentWidth.value - newRight) / props?.gridX) * props?.gridX;

    if (diffT > props?.gridY / 2) {
      diffT -= props?.gridY;
    }
    if (diffB > props?.gridY / 2) {
      diffB -= props?.gridY;
    }
    if (diffL > props?.gridX / 2) {
      diffL -= props?.gridX;
    }
    if (diffR > props?.gridX / 2) {
      diffR -= props?.gridX;
    }

    if (Math.abs(diffB) < Math.abs(diffT)) {
      alignTop = false;
    }
    if (Math.abs(diffR) < Math.abs(diffL)) {
      alignLeft = false;
    }

    newTop -= alignTop ? diffT : diffB;
    newBottom = parentHeight.value - height.value - newTop;
    newLeft -= alignLeft ? diffL : diffR;
    newRight = parentWidth.value - width.value - newLeft;
  }

  ({
    newLeft: left.value,
    newRight: right.value,
    newTop: top.value,
    newBottom: bottom.value,
  } = rectCorrectionByLimit({ newLeft, newRight, newTop, newBottom }));

  emits("dragging", rect.value);
}

function bodyDown(ev: MouseEvent | { pageX: number; pageY: number }) {
  const { target, button } = ev as MouseEvent;

  if (!props?.preventActiveBehavior) {
    active.value = true;
  }

  if (button && button !== 0) {
    return;
  }

  emits("clicked", ev);

  if (!active.value) {
    return;
  }

  if (
    props?.dragHandle &&
    (target as HTMLElement)?.getAttribute("data-drag-handle") !==
      instance?.uid.toString()
  ) {
    return;
  }

  if (
    props.dragCancel &&
    (target as HTMLElement)?.getAttribute("data-drag-cancel") ===
      instance?.uid.toString()
  ) {
    return;
  }

  if (typeof (ev as MouseEvent).stopPropagation !== "undefined") {
    (ev as MouseEvent).stopPropagation();
  }

  if (typeof (ev as MouseEvent).preventDefault !== "undefined") {
    (ev as MouseEvent).preventDefault();
  }

  if (props.isDraggable) {
    bodyDrag.value = true;
  }

  const pointerX =
    typeof ev.pageX !== "undefined"
      ? ev.pageX
      : (ev as unknown as TouchEvent).touches[0].pageX;
  const pointerY =
    typeof ev.pageY !== "undefined"
      ? ev.pageY
      : (ev as unknown as TouchEvent).touches[0].pageY;

  saveDimensionsBeforeMove({ pointerX, pointerY });

  if (props?.parentLimitation) {
    limits.value = calcDragLimitation();
  }
}

function saveDimensionsBeforeMove({
  pointerX,
  pointerY,
}: {
  pointerX: number;
  pointerY: number;
}) {
  dimensionsBeforeMove.value.pointerX = pointerX;
  dimensionsBeforeMove.value.pointerY = pointerY;

  dimensionsBeforeMove.value.left = left.value;
  dimensionsBeforeMove.value.right = right.value;
  dimensionsBeforeMove.value.top = top.value;
  dimensionsBeforeMove.value.bottom = bottom.value;

  dimensionsBeforeMove.value.width = width.value;
  dimensionsBeforeMove.value.height = height.value;

  aspectFactor.value = width.value / height.value;
}

function stickDown(stick: Sticks, ev: MouseEvent, force = false) {
  if ((!props?.isResizable || !active.value) && !force) {
    return;
  }

  stickDrag.value = true;

  const pointerX =
    typeof ev.pageX !== "undefined"
      ? ev.pageX
      : (ev as unknown as TouchEvent).touches[0].pageX;
  const pointerY =
    typeof ev.pageY !== "undefined"
      ? ev.pageY
      : (ev as unknown as TouchEvent).touches[0].pageY;

  saveDimensionsBeforeMove({ pointerX, pointerY });

  currentStick.value = stick;

  limits.value = calcResizeLimits();
}

function calcResizeLimits() {
  const parentLim = props?.parentLimitation ? 0 : null;

  if (props?.aspectRatio) {
    if (minWidth.value / minHeight.value > aspectFactor.value) {
      minHeight.value = minWidth.value / aspectFactor.value;
    } else {
      minWidth.value = aspectFactor.value * minHeight.value;
    }
  }

  const limits = {
    left: { min: parentLim, max: left.value + (width.value - minWidth.value) },
    right: {
      min: parentLim,
      max: right.value + (width.value - minWidth.value),
    },
    top: { min: parentLim, max: top.value + (height.value - minHeight.value) },
    bottom: {
      min: parentLim,
      max: bottom.value + (height.value - minHeight.value),
    },
  };

  if (props?.aspectRatio) {
    const aspectLimits = {
      left: {
        min:
          left.value -
          Math.min(top.value, bottom.value) * aspectFactor.value * 2,
        max:
          left.value +
          ((height.value - minHeight.value) / 2) * aspectFactor.value * 2,
      },
      right: {
        min:
          right.value -
          Math.min(top.value, bottom.value) * aspectFactor.value * 2,
        max:
          right.value +
          ((height.value - minHeight.value) / 2) * aspectFactor.value * 2,
      },
      top: {
        min:
          top.value -
          (Math.min(left.value, right.value) / aspectFactor.value) * 2,
        max:
          top.value +
          ((width.value - minWidth.value) / 2 / aspectFactor.value) * 2,
      },
      bottom: {
        min:
          bottom.value -
          (Math.min(left.value, right.value) / aspectFactor.value) * 2,
        max:
          bottom.value +
          ((width.value - minWidth.value) / 2 / aspectFactor.value) * 2,
      },
    };

    if (currentStick.value[0] === "m") {
      limits.left = {
        min: Math.max(limits.left.min!, aspectLimits.left.min),
        max: Math.min(limits.left.max, aspectLimits.left.max),
      };
      limits.right = {
        min: Math.max(limits.right.min!, aspectLimits.right.min),
        max: Math.min(limits.right.max, aspectLimits.right.max),
      };
    } else if (currentStick.value[1] === "m") {
      limits.top = {
        min: Math.max(limits.top.min!, aspectLimits.top.min),
        max: Math.min(limits.top.max, aspectLimits.top.max),
      };
      limits.bottom = {
        min: Math.max(limits.bottom.min!, aspectLimits.bottom.min),
        max: Math.min(limits.bottom.max, aspectLimits.bottom.max),
      };
    }
  }

  return limits;
}

function calcDragLimitation() {
  return {
    left: { min: 0, max: parentWidth.value - width.value },
    right: { min: 0, max: parentWidth.value - width.value },
    top: { min: 0, max: parentHeight.value - height.value },
    bottom: { min: 0, max: parentHeight.value - height.value },
  };
}

function addEvents(events: Map<string, EventListener>) {
  events.forEach((cb, eventName) => {
    document.documentElement.addEventListener(eventName, cb);
  });
}

function removeEvents(events: Map<string, EventListener>) {
  events.forEach((cb, eventName) => {
    document.documentElement.removeEventListener(eventName, cb);
  });
}

watch(active, (isActive) => {
  if (isActive) {
    emits("activated");
  } else {
    emits("deactivated");
  }
});

watch(
  () => props?.isActive,
  (v) => {
    active.value = v;
  },
  {
    immediate: true,
  }
);

watch(
  zIndex,
  (v) => {
    if (Number(v) >= 0 || v === "auto") {
      zIndex.value = v;
    }
  },
  {
    immediate: true,
  }
);

watch(
  () => props?.x,
  (newVal, oldVal) => {
    if (stickDrag.value || bodyDrag.value || newVal === left.value) {
      return;
    }

    const delta = oldVal - newVal;

    bodyDown({ pageX: left.value, pageY: top.value });
    bodyMove({ x: delta, y: 0 });

    nextTick(() => {
      bodyUp();
    });
  }
);

watch(
  () => props?.y,
  (newVal, oldVal) => {
    if (stickDrag.value || bodyDrag.value || newVal === top.value) {
      return;
    }

    const delta = oldVal - newVal;

    bodyDown({ pageX: left.value, pageY: top.value });
    bodyMove({ x: 0, y: delta });

    nextTick(() => {
      bodyUp();
    });
  }
);

watch(
  () => props?.w,
  (newVal, oldVal) => {
    if (stickDrag.value || bodyDrag.value || newVal === width.value) {
      return;
    }

    const stick = "mr";
    const delta = Number(oldVal) - Number(newVal);

    stickDown(
      stick,
      { pageX: right.value, pageY: top.value + height.value / 2 } as MouseEvent,
      true
    );
    stickMove({ x: delta, y: 0 });

    nextTick(() => {
      stickUp();
    });
  }
);

watch(
  () => props?.h,
  (newVal, oldVal) => {
    if (stickDrag.value || bodyDrag.value || newVal === height.value) {
      return;
    }

    const stick = "bm";
    const delta = Number(oldVal) - Number(newVal);

    stickDown(
      stick,
      {
        pageX: left.value + width.value / 2,
        pageY: bottom.value,
      } as MouseEvent,
      true
    );
    stickMove({ x: 0, y: delta });

    nextTick(() => {
      stickUp();
    });
  }
);

watch(
  () => props?.parentW,
  (val) => {
    right.value = val - width.value - left.value;
    parentWidth.value = val;
  }
);

watch(
  () => props?.parentH,
  (val) => {
    bottom.value = val - height.value - top.value;
    parentHeight.value = val;
  }
);
</script>

<template>
  <div
    class="drag-resize"
    :style="positionStyle"
    :class="`${active || isActive ? 'active' : 'inactive'} ${
      contentClass ? contentClass : ''
    }`"
    @mousedown="bodyDown($event)"
    @touchstart="bodyDown($event as unknown as MouseEvent)"
    @touchend="up()"
  >
    <div :style="sizeStyle" class="content-container" ref="container">
      <slot></slot>
    </div>
    <template v-if="showStick !== false">
      <template v-for="(stick, i) in sticks" :key="i">
        <div
          class="drag-resize-stick"
          :class="[
            'drag-resize-stick-' + stick,
            isResizable ? '' : 'not-resizable',
          ]"
          @mousedown.stop.prevent="stickDown(stick, $event)"
          @touchstart.stop.prevent="
            stickDown(stick, $event as unknown as MouseEvent)
          "
          :style="drStick(stick)"
        >
          <div class="drag-resize-stick-wrapper">
            <slot name="stick" :position="stick" :style="drStick(stick)">
              <div
                class="drag-resize-stick-inner"
                :style="stickSizeStyle()"
              ></div>
            </slot>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.drag-resize {
  position: absolute;
  box-sizing: border-box;
}

.drag-resize.active:before {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  outline: 1px dashed #d6d6d6;
}

.drag-resize-stick {
  box-sizing: border-box;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}

.drag-resize-stick-wrapper {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.drag-resize-stick-inner {
  width: 100%;
  height: 100%;
  font-size: 1px;
  background: #ffffff;
  border: 1px solid #6c6c6c;
  box-shadow: 0 0 2px #bbb;
}

.inactive .drag-resize-stick {
  display: none;
}

.drag-resize-stick-tl,
.drag-resize-stick-br {
  cursor: nwse-resize;
}

.drag-resize-stick-tm,
.drag-resize-stick-bm {
  left: 50%;
  cursor: ns-resize;
}

.drag-resize-stick-tr,
.drag-resize-stick-bl {
  cursor: nesw-resize;
}

.drag-resize-stick-ml,
.drag-resize-stick-mr {
  top: 50%;
  cursor: ew-resize;
}

.drag-resize-stick.not-resizable {
  display: none;
}

.content-container {
  display: block;
  position: relative;
}
</style>
