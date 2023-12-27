import { Component, Match, Show, Switch } from "solid-js";
import { Cell } from "../store/cell";
import { CodeCell } from "./code-cell";
import { TextCell } from "./text-cell";
import { createSortable, useDragDropContext } from "@thisbeyond/solid-dnd";
import { useAppSelector } from "../store";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      sortable: boolean;
    }
  }
}

interface Props {
  cell: Cell;
  dragHandleDirective?: ReturnType<typeof createSortable>;
}

export const CellListItem: Component<Props> = (props) => {
  const {
    cellService: { removeCell, updateCellUseSolid },
  } = useAppSelector();
  const sortable = createSortable(props.cell.id);
  const [state] = useDragDropContext()!;

  return (
    <div
      classList={{
        "opacity-25": sortable.isActiveDraggable || sortable.isActiveDroppable,
        "transition-transform": !!state.active.draggable,
      }}
    >
      <div class="card shadow overflow-hidden bg-base-100">
        {/* Header */}
        <div use:sortable class="py-2 px-5 cursor-grab bg-base-200">
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
                <ul
                  tabIndex={0}
                  class="dropdown-content p-2 shadow-2xl bg-base-300 rounded-box w-[150px] z-10"
                >
                  <li
                    class="flex flex-row flex-wrap btn btn-sm btn-block btn-ghost m-0"
                    onclick={() => {
                      updateCellUseSolid(props.cell.id, false);
                    }}
                  >
                    <img src="/react.svg" alt="React" class="w-6 -ml-2.5" />
                    <p>React</p>
                  </li>
                  <li
                    class="flex flex-row flex-wrap btn btn-sm btn-block btn-ghost m-0"
                    onclick={() => {
                      updateCellUseSolid(props.cell.id, true);
                    }}
                  >
                    <img src="/solid.svg" alt="Solid" class="w-6 -ml-2.5" />
                    <p>Solid</p>
                  </li>
                </ul>
              </div>
            </Show>
            <div class="ml-auto">
              <button
                class="btn btn-square btn-sm"
                onclick={() => removeCell(props.cell.id)}
              >
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
          <Match when={props.cell.type === "code"}>
            <CodeCell
              input={props.cell.content}
              useSolid={props.cell.useSolid}
            />
          </Match>
          <Match when={props.cell.type === "text"}>
            <TextCell initialValue={props.cell.content} />
          </Match>
        </Switch>
      </div>
    </div>
  );
};
