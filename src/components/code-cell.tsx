import { Component, createSignal } from "solid-js";
import { Editor } from "../components/editor";
import { Preview } from "../components/preview";
import { compile } from "../bundler";
import { Resizer } from "./resizer";

interface Props {
  input?: string;
  useSolid?: boolean;
}

export const CodeCell: Component<Props> = (props) => {
  // Height state (for UI)
  const [height, setHeight] = createSignal<number>();
  const [isResizing, setIsResizing] = createSignal<boolean>(false);

  // Code and input state
  const [input, setInput] = createSignal<string>(props.input || "");
  const [code, setCode] = createSignal<string>();
  const [err, setErr] = createSignal<string>();

  // Compile code
  const onClick = async () => {
    const compileResult = await compile(input(), { useSolid: props.useSolid });

    compileResult.code && setCode(compileResult.code);
    compileResult.err && setErr(compileResult.err);
  };

  return (
    <Resizer
      resizes={["s"]}
      initialHeight={400}
      onResizing={(isResizing) => setIsResizing(isResizing || false)}
      onHeightChange={(height) => {
        setHeight(height);
      }}
    >
      <div class="flex flex-row flex-wrap w-full h-full">
        <Resizer
          resizes={["e"]}
          initialWidth={window.innerWidth / 2}
          onResizing={(isResizing) => setIsResizing(isResizing || false)}
          height={height()}
        >
          <Editor
            initialValue={input()}
            onSave={(content) => {
              setInput(content);
              onClick();
            }}
          />
        </Resizer>
        <div
          classList={{
            "flex-1 relative": true,
            "after:absolute after:top-0 after:left-0 after:bottom-0 after:right-0":
              isResizing(),
            "select-none": isResizing(),
          }}
        >
          <Preview code={code()} err={err()} />
        </div>
      </div>
    </Resizer>
  );
};
