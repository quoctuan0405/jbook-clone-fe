import {
  ParentComponent,
  Show,
  children,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

type ResizeType = "n" | "e" | "s" | "w";

interface Props {
  resizes?: ResizeType[];
  handlerHeight?: number;
  handlerWidth?: number;
  onHeightChange?: (height: number | undefined) => any;
  onWidthChange?: (width: number | undefined) => any;
  onResizing?: (isResizing: boolean) => any;
  initialWidth?: number;
  initialHeight?: number;
  height?: number;
  width?: number;
}

// Read https://medium.com/the-z/making-a-resizable-div-in-js-is-not-easy-as-you-think-bda19a1bc53d
// Remember to change pageY to clientY, pageX to clientX
// pageY, pageX is RELATIVE to the window, while clientY, clientX is ABSOLUTE
export const Resizer: ParentComponent<Props> = (props) => {
  const {
    resizes = ["e", "n", "s", "w"],
    handlerHeight = 8,
    handlerWidth = 8,
    initialWidth,
    initialHeight,
    onHeightChange,
    onWidthChange,
    onResizing,
  } = props;

  // Calculate default width and height of element in case initial width and height is not set
  onMount(() => {
    if (container) {
      if (initialHeight === undefined || initialHeight === null) {
        setHeight(container?.getBoundingClientRect().height);
      }

      if (initialWidth === undefined || initialWidth === null) {
        setWidth(container?.getBoundingClientRect().width);
      }
    }
  });

  // Width and height of children
  const [height, setHeight] = createSignal<number | undefined>(
    props.height || initialHeight
  );
  const [width, setWidth] = createSignal<number | undefined>(
    props.width || initialWidth
  );

  createEffect(() => {
    if (props.width !== null && props.width !== undefined) {
      setWidth(props.width);
    }
  });

  createEffect(() => {
    if (props.height !== null && props.height !== undefined) {
      setHeight(props.height);
    }
  });

  // Is resizing
  const [isTopResizing, setIsTopResizing] = createSignal<boolean>();
  const [isLeftResizing, setIsLeftResizing] = createSignal<boolean>();
  const [isBottomResizing, setIsBottomResizing] = createSignal<boolean>();
  const [isRightResizing, setIsRightResizing] = createSignal<boolean>();

  createEffect(() => {
    const isTopResizingValue = isTopResizing();
    if (isTopResizingValue !== null && isTopResizingValue !== undefined) {
      onResizing && onResizing(isTopResizingValue);
    }

    const isLeftResizingValue = isLeftResizing();
    if (isLeftResizingValue !== null && isLeftResizingValue !== undefined) {
      onResizing && onResizing(isLeftResizingValue);
    }

    const isBottomResizingValue = isBottomResizing();
    if (isBottomResizingValue !== null && isBottomResizingValue !== undefined) {
      onResizing && onResizing(isBottomResizingValue);
    }

    const isRightResizingValue = isRightResizing();
    if (isRightResizingValue !== null && isRightResizingValue !== undefined) {
      onResizing && onResizing(isRightResizingValue);
    }
  });

  // Only resize element when mousedown (on the element) && mousemove (on the window)
  // Remove mousemove event listener on window mouseup
  onMount(() => {
    resizes.indexOf("n") !== -1 &&
      window.addEventListener("mouseup", removeResizeTopElementListener);
    resizes.indexOf("s") !== -1 &&
      window.addEventListener("mouseup", removeResizeBottomElementListener);
    resizes.indexOf("e") !== -1 &&
      window.addEventListener("mouseup", removeResizeRightElementListener);
    resizes.indexOf("w") !== -1 &&
      window.addEventListener("mouseup", removeResizeLeftElementListener);
  });

  onCleanup(() => {
    resizes.indexOf("n") !== -1 &&
      window.removeEventListener("mouseup", removeResizeTopElementListener);
    resizes.indexOf("s") !== -1 &&
      window.removeEventListener("mouseup", removeResizeBottomElementListener);
    resizes.indexOf("e") !== -1 &&
      window.removeEventListener("mouseup", removeResizeRightElementListener);
    resizes.indexOf("w") !== -1 &&
      window.removeEventListener("mouseup", removeResizeLeftElementListener);
  });

  // Container ref
  let container: HTMLDivElement | undefined;

  // Listeners
  const removeResizeTopElementListener = () => {
    window.removeEventListener("mousemove", resizeTopElementListener);

    setIsTopResizing(false);
  };

  const resizeTopElementListener = (e: MouseEvent) => {
    if (container) {
      const height =
        container.getBoundingClientRect().height -
        (e.clientY - container.getBoundingClientRect().top);

      setHeight(height);
      setIsTopResizing(true);

      onHeightChange && onHeightChange(height);
    }
  };

  const removeResizeBottomElementListener = () => {
    window.removeEventListener("mousemove", resizeBottomElementListener);

    setIsBottomResizing(false);
  };

  const resizeBottomElementListener = (e: MouseEvent) => {
    if (container) {
      const height =
        container.getBoundingClientRect().height +
        (e.clientY - container.getBoundingClientRect().bottom);

      setHeight(height);
      setIsBottomResizing(true);

      onHeightChange && onHeightChange(height);
    }
  };

  const removeResizeRightElementListener = () => {
    window.removeEventListener("mousemove", resizeRightElementListener);

    setIsRightResizing(false);
  };

  const resizeRightElementListener = (e: MouseEvent) => {
    if (container) {
      const width =
        container.getBoundingClientRect().width +
        (e.clientX - container.getBoundingClientRect().right);

      setWidth(width);
      setIsRightResizing(true);

      onWidthChange && onWidthChange(width);
    }
  };

  const removeResizeLeftElementListener = () => {
    window.removeEventListener("mousemove", resizeLeftElementListener);

    setIsLeftResizing(false);
  };

  const resizeLeftElementListener = (e: MouseEvent) => {
    if (container) {
      const width =
        container.getBoundingClientRect().width -
        (e.clientX - container.getBoundingClientRect().left);

      setWidth(width);
      setIsLeftResizing(true);

      onWidthChange && onWidthChange(width);
    }
  };

  return (
    <div
      ref={container}
      class="relative"
      style={{
        height: height() ? `${height()}px` : "100%",
        width: width() ? `${width()}px` : "100%",
      }}
    >
      {/* Resize top */}
      <Show when={resizes.indexOf("n") !== -1}>
        <div
          classList={{
            "absolute top-0 left-0 w-full cursor-n-resize hover:bg-blue-400 duration-500 z-10":
              true,
            "bg-blue-400": isTopResizing(),
          }}
          style={{ height: `${handlerHeight}px` }}
          onmousedown={() => {
            window.addEventListener("mousemove", resizeTopElementListener);
          }}
        />
      </Show>
      {/* Resize left */}
      <Show when={resizes.indexOf("w") !== -1}>
        <div
          classList={{
            "absolute top-0 left-0 h-full cursor-w-resize hover:bg-blue-400 duration-500 z-10":
              true,
            "bg-blue-400": isLeftResizing(),
          }}
          style={{ width: `${handlerWidth}px` }}
          onmousedown={() => {
            window.addEventListener("mousemove", resizeLeftElementListener);
          }}
        />
      </Show>
      <div
        style={{
          width: `${width()}px`,
          height: `${height()}px`,
        }}
      >
        {children(() => props.children)()}
      </div>
      {/* Resize right */}
      <Show when={resizes.indexOf("e") !== -1}>
        <div
          classList={{
            "absolute top-0 right-0 h-full cursor-w-resize hover:bg-blue-400 duration-500 z-10":
              true,
            "bg-blue-400": isRightResizing(),
          }}
          style={{ width: `${handlerWidth}px` }}
          onmousedown={() => {
            window.addEventListener("mousemove", resizeRightElementListener);
          }}
        />
      </Show>
      {/* Resize bottom */}
      <Show when={resizes.indexOf("s") !== -1}>
        <div
          classList={{
            "absolute bottom-0 left-0 w-full cursor-s-resize hover:bg-blue-400 duration-500 z-10":
              true,
            "bg-blue-400": isBottomResizing(),
          }}
          style={{ height: `${handlerHeight}px` }}
          onmousedown={() => {
            window.addEventListener("mousemove", resizeBottomElementListener);
          }}
        />
      </Show>
    </div>
  );
};
