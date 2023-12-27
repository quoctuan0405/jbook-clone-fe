import { createEffect } from "solid-js";
import * as esbuild from "esbuild-wasm";
import { StoreProvider } from "./store";
import { TopBar } from "./other-unrelated-to-the-course-components/top-bar";
import { CellList } from "./components/cell-list";

export default () => {
  // Load ESBuild
  const startService = async () => {
    await esbuild.initialize({
      worker: true,
      wasmURL: "https://unpkg.com/esbuild-wasm@0.19.10/esbuild.wasm",
    });
  };

  createEffect(async () => {
    await startService();
  });

  return (
    <StoreProvider>
      <div>
        <TopBar />
        <div class="px-2 pb-10">
          <CellList />
        </div>
      </div>
    </StoreProvider>
  );
};
