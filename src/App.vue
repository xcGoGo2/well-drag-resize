<script setup lang="ts">
import { onMounted, ref } from "vue";
import { DragResize } from "./components";

const rects = [
  {
    width: 200,
    height: 150,
    top: 10,
    left: 10,
    draggable: true,
    resizable: true,
    minw: 10,
    minh: 10,
    axis: "both",
    parentLim: true,
    snapToGrid: false,
    aspectRatio: false,
    zIndex: 1,
    color: "#EF9A9A",
    active: false,
  },
  {
    width: 200,
    height: 150,
    top: 170,
    left: 220,
    draggable: true,
    resizable: true,
    minw: 10,
    minh: 10,
    axis: "both",
    parentLim: true,
    snapToGrid: false,
    aspectRatio: false,
    zIndex: 1,
    color: "#E6C27A",
    active: false,
    class: "box-shaddow",
  },
  {
    width: 200,
    height: 150,
    top: 10,
    left: 220,
    draggable: true,
    resizable: true,
    minw: 10,
    minh: 10,
    axis: "both",
    parentLim: true,
    snapToGrid: false,
    aspectRatio: false,
    zIndex: 2,
    color: "#AED581",
    active: false,
  },
  {
    width: 200,
    height: 150,
    top: 170,
    left: 10,
    draggable: true,
    resizable: true,
    minw: 10,
    minh: 10,
    axis: "both",
    parentLim: true,
    snapToGrid: false,
    aspectRatio: false,
    zIndex: 3,
    color: "#81D4FA",
    active: false,
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
      :w="rect.width"
      :h="rect.height"
      :x="rect.left"
      :y="rect.top"
      :parentW="listWidth"
      :parentH="listHeight"
      :axis="rect.axis"
      :isActive="rect.active"
      :minw="rect.minw"
      :minh="rect.minh"
      :isDraggable="rect.draggable"
      :isResizable="rect.resizable"
      :parentLimitation="rect.parentLim"
      :snapToGrid="rect.snapToGrid"
      :aspectRatio="rect.aspectRatio"
      :z="rect.zIndex"
      :contentClass="rect.class"
    >
      <div class="filler" :style="{ backgroundColor: rect.color }"></div>
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
}
</style>
