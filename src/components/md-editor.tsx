import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  untrack,
} from "solid-js";
import { useAppSelector } from "../store";
// @ts-ignore
import Editor from "@toast-ui/editor";
import type { ThemeType } from "../store/theme";

interface Props {
  height?: number;
  initialValue?: string;
}

export const MdEditor: Component<Props> = (props) => {
  // Get theme from store
  const {
    themeService: { theme },
  } = useAppSelector();

  // Ref
  let divEl: HTMLDivElement | undefined;
  let editor: Editor | undefined;

  // Store html content on state because we will destroy the editor when theme change from 'light' to dark (trick because this editor has no changeTheme method)
  const [html, setHTML] = createSignal<string>(props.initialValue || "");
  const [currentEditorTheme, setCurrentEditorTheme] = createSignal<ThemeType>(
    theme.type
  );

  // Central function to create editor
  const createEditor = (
    divEl: HTMLDivElement,
    themeType: ThemeType,
    height: number
  ) => {
    const editor = new Editor({
      el: divEl,
      usageStatistics: false,
      previewStyle: "vertical",
      theme: themeType === "light" ? "light" : "dark",
      height: `${height}px`,
      events: {
        change: () => {
          setHTML(editor.getHTML());
        },
      },
    });

    editor.setHTML(html());

    return editor;
  };

  // Create and destroy editor onMount and onCleanup
  onMount(() => {
    if (divEl) {
      editor = createEditor(divEl, theme.type, props.height || 300);

      setCurrentEditorTheme(theme.type);
    }
  });

  onCleanup(() => {
    if (editor) {
      editor.destroy();
    }
  });

  // Destroy and recreate editor on change theme from 'dark' to 'light and 'light' to 'dark'
  createEffect(() => {
    const themeType = theme.type;

    untrack(() => {
      if (editor && divEl && theme.type !== currentEditorTheme()) {
        editor.destroy();

        editor = createEditor(divEl, themeType, props.height || 300);

        setCurrentEditorTheme(theme.type);
      }
    });
  });

  createEffect(() => {
    if (editor) {
      editor.setHeight(`${props.height || 300}px`);
    }
  });

  editor?.on;

  return <div ref={divEl}></div>;
};
