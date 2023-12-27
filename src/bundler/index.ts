import * as esbuild from "esbuild-wasm";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";
import { solidPlugin } from "./plugins/solid-plugin";

interface Options {
  useSolid?: boolean;
}

interface CompileResult {
  code?: string;
  err?: string;
}

export const compile = async (
  rawCode: string,
  options?: Options
): Promise<CompileResult> => {
  // Plugins
  const plugins = [unpkgPathPlugin(), fetchPlugin(rawCode)];
  if (options && options.useSolid) {
    plugins.unshift(solidPlugin(rawCode));
  }

  // Build
  try {
    const result = await esbuild.build({
      entryPoints: ["index.jsx"],
      bundle: true,
      write: false,
      plugins,
      define: { "process.env.NODE_ENV": `"production"`, global: "window" },
    });

    if (result.outputFiles && result.outputFiles.length !== 0) {
      const compileResult = result.outputFiles[0].text;

      return {
        code: compileResult,
      };
    }

    return {
      err: "Compile unsuccessfully",
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        err: err.message,
      };
    }

    return {
      err: "Error occurred",
    };
  }
};
