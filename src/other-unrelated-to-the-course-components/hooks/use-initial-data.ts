import { onMount } from "solid-js";
import { useAppSelector } from "../../store";

export const useInitialData = () => {
  const {
    cellService: { insertCell },
  } = useAppSelector();

  onMount(() => {
    insertCell({
      cellType: "text",
      content: `
        <h1>Jbook clone SolidJS frontend</h1>
            <p><strong>Huge shout out for Stephen Grider for create such an awesome <a href="https://www.udemy.com/course/react-and-typescript-build-a-portfolio-project/">course</a></strong></p>
            <h5>Why I create this application?</h5>
            <p>I spent quite a lot of time figuring out how to compile SolidJS in the browser. I hope it will probably help someone out there. <br>
                Check out the source code and how I do that at: https://github.com/quoctuan0405/jbook-clone-fe
            </p>
        <h5>This application use:</h5>
        <ul>
            <li>
                <p>SolidJS</p>
            </li>
            <li>
                <p>Can compile SolidJS</p>
            </li>
            <li>
                <p>Dragable list (SolidDND)</p>
            </li>
            <li>
                <p>TailwindCSS in iframe (kind of)</p>
            </li>
        </ul>
    `,
    });

    insertCell({
      cellType: "code",
      content: `// Press Ctrl+S in this editor to compile
import { render } from "solid-js/web";

render(() => <div>Hi there SolidJS</div>, document.querySelector("#root"));`,
      useSolid: true,
    });

    insertCell({
      cellType: "code",
      content: `// Press Ctrl+S in this editor to compile
import React from "react";
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.querySelector("#root")).render(
<div>Hi there ReactJS</div>,
);`,
      useSolid: false,
    });
  });
};
