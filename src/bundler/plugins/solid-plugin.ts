import * as esbuild from "esbuild-wasm";
import { transform } from "@babel/standalone";
// @ts-ignore
import babelPresetSolid from "babel-preset-solid";

export const solidPlugin = (inputCode: string): esbuild.Plugin => {
  return {
    name: "plugin-solid",
    setup: (build) => {
      // using skypack to load solid.js
      build.onResolve({ filter: /^solid-js/ }, (args) => {
        return {
          namespace: "a",
          path: new URL(
            args.path,
            "https://cdn.skypack.dev/" + args.resolveDir + "/"
          ).href,
        };
      });

      // Overwriting default behaviour of es-build compile jsx to React.createComponent(...)
      build.onLoad({ filter: /(^index\.jsx$)/ }, async () => {
        const { code } = transform(inputCode, {
          presets: [[babelPresetSolid, { generate: "dom", hydratable: false }]],
        });
        return {
          loader: "js",
          contents: code || undefined,
        };
      });
    },
  };
};
