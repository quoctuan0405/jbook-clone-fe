import * as monaco from "monaco-editor";
import { Component, createEffect, onMount } from "solid-js";
import { v4 as uuidv4 } from "uuid";
import prettier from "prettier/standalone";
import esTree from "prettier/plugins/estree";
import parser from "prettier/plugins/babel";
import { parse } from "@babel/parser";
import "./jsx-syntax.css";
// @ts-ignore
import traverse from "@babel/traverse";
// @ts-ignore
import MonacoJSXHighlighter from "monaco-jsx-highlighter";
import { useAppSelector } from "../store";

interface Props {
  id?: string;
  initialValue?: string;
  onSave?: (content: string) => any;
  onChange?: (content: string) => any;
}

export const Editor: Component<Props> = (props) => {
  let editorRef: HTMLDivElement | undefined;

  const { initialValue, onSave, onChange } = props;

  const {
    themeService: { theme },
  } = useAppSelector();

  onMount(async () => {
    monaco.editor.EditorOptions.wordWrap.defaultValue = "on";
    monaco.editor.EditorOptions.minimap.defaultValue = {
      enabled: false,
      autohide: true,
      side: "right",
      size: "fit",
      showSlider: "mouseover",
      renderCharacters: true,
      maxColumn: 120,
      scale: 1,
    };
    monaco.editor.EditorOptions.folding.defaultValue = false;
    monaco.editor.EditorOptions.lineNumbersMinChars.defaultValue = 3;
    monaco.editor.EditorOptions.fontSize.defaultValue = 16;
    monaco.editor.EditorOptions.automaticLayout.defaultValue = true;

    monaco.editor.setTheme(theme.type === "dark" ? "vs-dark" : "vs");

    // monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    //   target: monaco.languages.typescript.ScriptTarget.Latest,
    //   allowNonTsExtensions: true,
    //   moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    //   module: monaco.languages.typescript.ModuleKind.CommonJS,
    //   noEmit: true,
    //   esModuleInterop: true,
    //   jsx: monaco.languages.typescript.JsxEmit.React,
    //   reactNamespace: "React",
    //   allowJs: true,
    // });

    // monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    //   noSemanticValidation: false,
    //   noSyntaxValidation: false,
    // });

    const fileURI = props.id
      ? monaco.Uri.file(`${props.id}.jsx`)
      : monaco.Uri.file(`${uuidv4()}.jsx`);

    // Get model by URI
    const defaultModel = monaco.editor.getModel(fileURI);
    if (defaultModel) {
      defaultModel.onDidChangeContent(async () => {
        onChange && onChange(defaultModel.getValue());
      });
    }

    const editor = monaco.editor.create(editorRef!, {
      padding: { top: 20 },
      language: "javascript",
    });

    editor.addAction({
      id: "save-action",
      label: "Save",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: async () => {
        // Get model by URI
        const model = monaco.editor.getModel(fileURI);
        if (model) {
          const formatted = await prettier.format(model.getValue(), {
            parser: "babel",
            plugins: [parser, esTree],
          });

          model.setValue(formatted);

          onSave && onSave(formatted);
        }
      },
    });

    if (!monaco.editor.getModel(fileURI)) {
      const model = monaco.editor.createModel(
        initialValue || "const App = () => <div>Hi there</div>;",
        "javascript",
        fileURI
      );

      editor.setModel(model);
    }

    const monacoJSXHighlighter = new MonacoJSXHighlighter(
      monaco,
      parse,
      traverse,
      monaco.editor.getEditors()[0]
    );

    monacoJSXHighlighter.highlightOnDidChangeModelContent();
    monacoJSXHighlighter.addJSXCommentCommand();
  });

  createEffect(() => {
    monaco.editor.setTheme(theme.type === "dark" ? "vs-dark" : "vs");
  });

  return <div ref={editorRef} class="h-full"></div>;
};
