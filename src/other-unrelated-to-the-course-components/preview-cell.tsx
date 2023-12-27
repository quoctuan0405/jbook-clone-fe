import { Component, Match, Show, Switch } from "solid-js";
import { Cell } from "../store/cell";
import { MdEditor } from "../components/md-editor";

interface Props {
  cell: Cell;
}

export const PreviewCell: Component<Props> = (props) => {
  return (
    <div class="card shadow overflow-hidden bg-base-100 opacity-50">
      {/* Header */}
      <div class="py-2 px-5 cursor-grab bg-base-200">
        <div class="card-actions flex flex-row flex-wrap items-center">
          <Show when={props.cell.type === "code"}>
            <div class="dropdown">
              <div tabIndex={0} role="button" class="btn">
                <Switch>
                  <Match when={!props.cell.useSolid}>
                    <img src="/react.svg" alt="React" class="w-6" />
                    <p>React</p>
                  </Match>
                  <Match when={props.cell.useSolid}>
                    <img src="/solid.svg" alt="Solid" class="w-6" />
                    <p>Solid</p>
                  </Match>
                </Switch>
                <svg
                  width="12px"
                  height="12px"
                  class="h-2 w-2 fill-current opacity-60 inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 2048 2048"
                >
                  <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                </svg>
              </div>
            </div>
          </Show>
          <div class="ml-auto">
            <button class="btn btn-square btn-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Body */}
      <Switch>
        <Match when={props.cell.type === "text"}>
          <MdEditor height={100} />
        </Match>
        <Match when={props.cell.type === "code"}>
          <div class="h-[100px]"></div>
        </Match>
      </Switch>
    </div>
  );
};
