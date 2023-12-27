import { For, createSignal } from "solid-js";
import { useAppSelector } from "../store";

type ThemeType = "dark" | "light";

interface Theme {
  value: string;
  type: ThemeType;
}

export const ThemeSelector = () => {
  const {
    themeService: { theme, updateTheme },
  } = useAppSelector();

  const [themes] = createSignal<Theme[]>([
    { value: "light", type: "light" },
    { value: "dark", type: "dark" },
    { value: "cupcake", type: "light" },
    { value: "bumblebee", type: "light" },
    { value: "emerald", type: "light" },
    { value: "corporate", type: "light" },
    { value: "synthwave", type: "dark" },
    { value: "retro", type: "light" },
    { value: "cyberpunk", type: "light" },
    { value: "valentine", type: "light" },
    { value: "halloween", type: "dark" },
    { value: "garden", type: "light" },
    { value: "forest", type: "dark" },
    { value: "aqua", type: "light" },
    { value: "lofi", type: "light" },
    { value: "pastel", type: "light" },
    { value: "fantasy", type: "light" },
    { value: "wireframe", type: "light" },
    { value: "black", type: "dark" },
    { value: "luxury", type: "dark" },
    { value: "dracula", type: "dark" },
    { value: "cmyk", type: "light" },
    { value: "autumn", type: "light" },
    { value: "business", type: "dark" },
    { value: "acid", type: "light" },
    { value: "lemonade", type: "light" },
    { value: "night", type: "dark" },
    { value: "coffee", type: "dark" },
    { value: "winter", type: "light" },
    { value: "dim", type: "dark" },
    { value: "nord", type: "light" },
    { value: "sunset", type: "dark" },
  ]);

  return (
    <div class="dropdown">
      <div tabIndex={0} role="button" class="btn m-1">
        {theme.value.toUpperCase()}
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
        <For each={themes()}>
          {(theme) => (
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                aria-label={theme.value.toUpperCase()}
                value={theme.value}
                onClick={() => {
                  updateTheme(theme);
                }}
              />
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};
