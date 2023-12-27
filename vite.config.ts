import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import monacoEditorPluginModule from "vite-plugin-monaco-editor";

const isObjectWithDefaultFunction = (
  module: unknown
): module is { default: typeof monacoEditorPluginModule } =>
  module != null &&
  typeof module === "object" &&
  "default" in module &&
  typeof module.default === "function";

const monacoEditorPlugin = isObjectWithDefaultFunction(monacoEditorPluginModule)
  ? monacoEditorPluginModule.default
  : monacoEditorPluginModule;

export default defineConfig({
  // define: {
  //   "process.env.BABEL_TYPES_8_BREAKING": "true",
  //   "process.versions.node": "'19.3.0'",
  // },
  plugins: [nodePolyfills(), solid(), monacoEditorPlugin({})],
});
