import { Component } from "solid-js";

interface Props {
  onAddTextCell?: () => any;
  onAddCodeCell?: () => any;
}

export const AddCell: Component<Props> = (props) => {
  return (
    <div class="divider">
      <button
        class="btn"
        onclick={() => {
          props.onAddTextCell && props.onAddTextCell();
        }}
      >
        Add text
      </button>
      <div class="divider"></div>
      <button
        class="btn"
        onclick={() => {
          props.onAddCodeCell && props.onAddCodeCell();
        }}
      >
        Add code
      </button>
    </div>
  );
};
