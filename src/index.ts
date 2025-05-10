// @ts-nocheck
import { DragResize } from "./components";
export * from "./components";

export function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component("drag-resize", DragResize);
}

// Create module definition for Vue.use()
const plugin = {
  install,
};

// Auto-install when vue is found (eg. in browser via <script> tag)
let GlobalVue = null;
if (typeof window !== "undefined") {
  GlobalVue = window.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

