import { createStore, produce } from "solid-js/store";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";

export type CellType = "code" | "text";

export interface Cell {
  id: string;
  type: CellType;
  useSolid: boolean;
  content: string;
}

export interface CellState {
  data: Record<string, Cell>;
  loading: boolean;
  error: string | null;
  order: string[];
}

const cellStore = createStore<CellState>({
  data: {},
  loading: false,
  error: null,
  order: [],
});

export const CellService = () => {
  const [cells, setCells] = cellStore;

  interface AddCellArgs {
    cellType: CellType;
    content?: string;
    useSolid?: boolean;
  }

  // Insert cell
  const insertCell = (cell: AddCellArgs) => {
    const cellId = uuidv4();

    // Add to data
    setCells(
      produce((state) => {
        state.data[cellId] = {
          id: cellId,
          content: cell.content || "",
          useSolid: cell.useSolid || false,
          type: cell.cellType,
        };
      })
    );

    // Add to order
    setCells(produce((state) => state.order.push(cellId)));
  };

  // Insert cell after
  const insertCellAfter = (cellId: string, cell: AddCellArgs) => {
    const newCellId = uuidv4();

    // Add to data
    setCells(
      produce((state) => {
        state.data[newCellId] = {
          id: newCellId,
          content: cell.content || "",
          useSolid: cell.useSolid || false,
          type: cell.cellType,
        };
      })
    );

    // Add to order
    setCells(
      produce((state) => {
        const index = state.order.indexOf(cellId);

        state.order.splice(index + 1, 0, newCellId);
      })
    );
  };

  // Swap cell
  const swapCellOrder = (cellId1: string, cellId2: string) => {
    setCells(
      produce((state) => {
        const fromIndex = state.order.indexOf(cellId1);
        const toIndex = state.order.indexOf(cellId2);

        if (fromIndex !== toIndex) {
          state.order[fromIndex] = state.order.splice(
            toIndex,
            1,
            state.order[fromIndex]
          )[0];
        }
      })
    );
  };

  // Remove cell
  const removeCell = (cellId: string) => {
    setCells(
      produce((state) => {
        _.omit(state.order, cellId);

        _.remove(state.order, (id) => {
          return id === cellId;
        });
      })
    );
  };

  // Update cell's content
  const updateCellContent = (cellId: string, content: string) => {
    setCells(
      produce((state) => {
        state.data[cellId] && (state.data[cellId].content = content);
      })
    );
  };

  // Update cell's useSolid
  const updateCellUseSolid = (cellId: string, useSolid: boolean) => {
    setCells(
      produce((state) => {
        state.data[cellId] && (state.data[cellId].useSolid = useSolid);
      })
    );
  };

  return {
    cells,
    insertCell,
    swapCellOrder,
    removeCell,
    updateCellContent,
    insertCellAfter,
    updateCellUseSolid,
  };
};
