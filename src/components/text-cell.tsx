import { Component, createSignal } from "solid-js";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import { Resizer } from "./resizer";
import { MdEditor } from "./md-editor";

interface Props {
  initialValue?: string;
}

export const TextCell: Component<Props> = (props) => {
  const [height, setHeight] = createSignal<number>(400);
  const [isResizing, setIsResizing] = createSignal<boolean>(false);
  return (
    <Resizer
      resizes={["s"]}
      initialHeight={height()}
      onHeightChange={(height) => height && setHeight(height)}
      onResizing={(isResizing) => setIsResizing(isResizing)}
    >
      <div
        classList={{
          relative: true,
          "after:absolute after:top-0 after:left-0 after:bottom-0 after:right-0":
            isResizing(),
          "select-none": isResizing(),
        }}
      >
        <MdEditor height={height()} initialValue={props.initialValue} />
      </div>
    </Resizer>
  );
};
