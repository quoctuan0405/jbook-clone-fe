import { ThemeSelector } from "./theme-selector";

export const TopBar = () => {
  return (
    <div class="flex flex-row flex-wrap p-2 items-center">
      <div class="prose ml-3">
        <h3>Jbook clone</h3>
      </div>
      <div class="ml-auto mr-[50px]">
        <ThemeSelector />
      </div>
    </div>
  );
};
