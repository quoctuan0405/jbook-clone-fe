import { ParentComponent, createContext, useContext } from "solid-js";
import { ThemeService } from "./theme";
import { CellService } from "./cell";
export type RootState = {
  themeService: ReturnType<typeof ThemeService>;
  cellService: ReturnType<typeof CellService>;
};

const rootState: RootState = {
  themeService: ThemeService(),
  cellService: CellService(),
};

const StoreContext = createContext<RootState>();

export const useAppSelector = () => useContext(StoreContext)!;

export const StoreProvider: ParentComponent = (props) => {
  return (
    <StoreContext.Provider value={rootState}>
      {props.children}
    </StoreContext.Provider>
  );
};
