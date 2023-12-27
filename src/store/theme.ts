import { createStore } from "solid-js/store";

export type ThemeType = "dark" | "light";

interface Theme {
  value: string;
  type: ThemeType;
}

const themeStore = createStore<Theme>({ value: "light", type: "light" });

export const ThemeService = () => {
  const [theme, setTheme] = themeStore;

  const updateTheme = (theme: Theme) => {
    setTheme(() => theme);
  };

  return { theme, updateTheme };
};
