import * as esbuild from "esbuild-wasm";

export const unpkgPathPlugin = (): esbuild.Plugin => {
  return {
    name: "unpkg-path-plugin",
    setup: (build: esbuild.PluginBuild) => {
      // entry point index.js file
      build.onResolve({ filter: /(^index\.jsx$)/ }, (args) => {
        return { path: args.path, namespace: "a" };
      });

      // Support both Skypack and Unpkg (Skypack for Solid and Unpkg for React)
      // Read more about the React fixed version issue of Skypack at: https://github.com/skypackjs/skypack-cdn/issues/88

      // relative path like (./) or (../)
      build.onResolve({ filter: /^\.+\// }, (args) => {
        if (args.importer.indexOf("cdn.skypack.dev") !== -1) {
          // If the importer is skypack, keep using skypack
          return {
            namespace: "a",
            path: new URL(
              args.path,
              "https://cdn.skypack.dev/" + args.resolveDir + "/"
            ).href,
          };
        } else {
          // If the importer is unpkg, keep using unpkg
          return {
            namespace: "a",
            path: new URL(
              args.path,
              "https://unpkg.com" + args.resolveDir + "/"
            ).href,
          };
        }
      });

      // all other cases
      build.onResolve({ filter: /.*/ }, async (args) => {
        if (args.importer.indexOf("cdn.skypack.dev") !== -1) {
          // If the importer is skypack, keep using skypack
          return {
            namespace: "a",
            path: `https://cdn.skypack.dev/${args.path}`,
          };
        } else {
          return {
            // If the importer is unpkg, keep using unpkg
            namespace: "a",
            path: `https://unpkg.com/${args.path}`,
          };
        }
      });
    },
  };
};
