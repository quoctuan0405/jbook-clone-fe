import axios from "axios";
import * as esbuild from "esbuild-wasm";
import { fileCache } from "../../fileCache";

export const fetchPlugin = (inputCode: string): esbuild.Plugin => {
  return {
    name: "fetch-plugin",
    setup: (build: esbuild.PluginBuild) => {
      build.onLoad({ filter: /(^index\.jsx$)/ }, () => {
        return {
          loader: "jsx",
          contents: inputCode,
        };
      });

      build.onLoad({ filter: /.*/ }, async (args) => {
        // Check if the args.path exists in cache
        const cachedResult = await fileCache.getItem<esbuild.BuildResult>(
          args.path
        );

        if (cachedResult) {
          // If cache exists, return immediately
          return cachedResult;
        }
      });

      build.onLoad({ filter: /.css$/ }, async (args) => {
        const { data, request } = await axios.get<string>(args.path);

        const escaped = data
          .replace(/\n/g, "")
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\;");

        const contents = `
                const style = document.createElement('style');
                style.innerText = '${escaped}';
                document.head.appendChild(style);
            `;

        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents,
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        await fileCache.setItem(args.path, result);

        return result;
      });

      build.onLoad({ filter: /.*/ }, async (args) => {
        const { data, request } = await axios.get<string>(args.path);

        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        await fileCache.setItem(args.path, result);

        return result;
      });
    },
  };
};
