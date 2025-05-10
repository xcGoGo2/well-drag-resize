import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";
import dts from 'vite-plugin-dts'
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS({
      configFile: "./uno.config.ts",
    }),
    dts({ tsconfigPath: './tsconfig.app.json', rollupTypes: true })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'well-drag-resize',
      formats: ['es'],
      fileName: 'well-drag-resize',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  
});
