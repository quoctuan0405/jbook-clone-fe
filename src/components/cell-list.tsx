import {
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
  SortableProvider,
  closestCenter,
  DragEventHandler,
} from "@thisbeyond/solid-dnd";
import { Component, createEffect, createSignal, For, Show } from "solid-js";
import { useAppSelector } from "../store";
import { CellListItem } from "./cell-list-item";
import { Cell } from "../store/cell";
import { PreviewCell } from "../other-unrelated-to-the-course-components/preview-cell";
import { AddCell } from "./add-cell";
import { useInitialData } from "../other-unrelated-to-the-course-components/hooks/use-initial-data";

export const CellList: Component = () => {
  // Initial data
  useInitialData();

  // Get data from store
  const {
    cellService: { insertCell, swapCellOrder, insertCellAfter },
  } = useAppSelector();
  const cells = useCellsSelector();

  // Handling drag and drop UI
  const [activeItem, setActiveItem] = createSignal<string>();

  const onDragStart: DragEventHandler = ({ draggable }) =>
    setActiveItem(draggable.id as string);

  const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
    if (draggable && droppable) {
      swapCellOrder(draggable.id as string, droppable.id as string);
    }
  };

  const showActiveItem = () => {
    const activeItemId = activeItem();
    const cell = cells().find((cell) => cell.id === activeItemId);
    if (activeItemId && cell) {
      return <PreviewCell cell={cell} />;
    }
  };

  return (
    <>
      {/* Sortable list */}
      <DragDropProvider
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        collisionDetector={closestCenter}
      >
        <DragDropSensors />

        <div class="flex flex-col flex-wrap space-y-10">
          <SortableProvider ids={cells().map(({ id }) => id)}>
            <For each={cells()}>
              {(cell) => (
                <>
                  <CellListItem cell={cell} />
                  <AddCell
                    onAddCodeCell={() =>
                      insertCellAfter(cell.id, {
                        cellType: "code",
                        content: "",
                      })
                    }
                    onAddTextCell={() =>
                      insertCellAfter(cell.id, {
                        cellType: "text",
                        content: "",
                      })
                    }
                  />
                </>
              )}
            </For>
          </SortableProvider>
        </div>

        <DragOverlay>
          <div>{showActiveItem()}</div>
        </DragOverlay>
      </DragDropProvider>

      {/* Add cell bar */}
      <Show when={cells().length === 0}>
        <AddCell
          onAddCodeCell={() =>
            insertCell({
              cellType: "code",
              content: "",
            })
          }
          onAddTextCell={() =>
            insertCell({
              cellType: "text",
              content: "",
            })
          }
        />
      </Show>
    </>
  );
};

const useCellsSelector = () => {
  const {
    cellService: {
      cells: { order, data },
    },
  } = useAppSelector();

  const [cells, setCells] = createSignal<Cell[]>([]);

  createEffect(() => {
    setCells(order.map((id) => data[id]));
  });

  return cells;
};
