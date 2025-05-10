<script setup lang="ts">
import { onMounted, ref } from "vue";
import { DragResize, type DragResizeProps } from "./components";

const rects: (DragResizeProps & { color: string; class?: string })[] = [
  {
    w: 200,
    h: 150,
    y: 10,
    x: 10,
    isDraggable: true,
    isResizable: true,
    minw: 10,
    minh: 10,
    axis: "both",
    parentLimitation: true,
    snapToGrid: false,
    aspectRatio: false,
    z: 1,
    color: "#EF9A9A",
    isActive: false,
  },
  {
    w: 200,
    h: 150,
    y: 170,
    x: 220,
    isDraggable: true,
    isResizable: true,
    minw: 10,
    minh: 10,
    axis: "both",
    parentLimitation: true,
    snapToGrid: false,
    aspectRatio: false,
    z: 1,
    color: "#E6C27A",
    isActive: false,
    class: "box-shaddow",
  },
  {
    w: 200,
    h: 150,
    y: 10,
    x: 220,
    isDraggable: true,
    isResizable: true,
    minw: 10,
    minh: 10,
    axis: "both",
    parentLimitation: true,
    snapToGrid: false,
    aspectRatio: false,
    z: 1,
    color: "#AED581",
    isActive: false,
  },
  {
    w: 200,
    h: 150,
    y: 170,
    x: 10,
    isDraggable: true,
    isResizable: true,
    minw: 10,
    minh: 10,
    axis: "both",
    parentLimitation: true,
    snapToGrid: false,
    aspectRatio: false,
    z: 1,
    color: "#81D4FA",
    isActive: false,
  },
];

const listWidth = ref(0);
const listHeight = ref(0);

onMounted(() => {
  let listEl = document.getElementById("container")!;
  listWidth.value = listEl.clientWidth;
  listHeight.value = listEl.clientHeight;

  window.addEventListener("resize", () => {
    listWidth.value = listEl.clientWidth;
    listHeight.value = listEl.clientHeight;
  });
});
</script>

<template>
  <div id="container">
    <DragResize
      v-for="(rect, index) in rects"
      :key="index"
      :w="rect.w"
      :h="rect.h"
      :x="rect.x"
      :y="rect.y"
      :parentW="listWidth"
      :parentH="listHeight"
      :axis="rect.axis"
      :isActive="rect.isActive"
      :minw="rect.minw"
      :minh="rect.minh"
      :isDraggable="rect.isDraggable"
      :isResizable="rect.isResizable"
      :parentLimitation="rect.parentLimitation"
      :snapToGrid="rect.snapToGrid"
      :aspectRatio="rect.aspectRatio"
      :z="rect.z"
      :contentClass="rect.class"
    >
      <div class="filler" :style="{ backgroundColor: rect.color }"></div>

      <template #stick="{ position }">
        <div class="stick">
          {{ position }}
        </div>
      </template>
    </DragResize>
  </div>
</template>

<style scoped>
#container {
  width: 100%;
  height: 100%;

  .filler {
    width: 100%;
    height: 100%;
    cursor: move;
  }

  .stick {
    width: 30px;
    height: 30px;
    background-color: aqua;
  }
}
</style>
