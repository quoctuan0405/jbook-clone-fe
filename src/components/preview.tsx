import axios from "axios";
import { Component, createEffect } from "solid-js";
import { fileCache } from "../fileCache";

interface Props {
  code?: string;
  err?: string;
}

const generateIframeHTML = async (err: string | null | undefined) => {
  const tailwindcssCDNPath = "/tailwind.min.js"; // https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio

  // Check if the args.path exists in cache
  const cachedResult = await fileCache.getItem<string>(tailwindcssCDNPath);

  // Data
  let tailwindCode: string | undefined;

  if (cachedResult) {
    tailwindCode = cachedResult;
  } else {
    // Get script from tailwind cdn
    const { data } = await axios.get<string>(tailwindcssCDNPath);

    await fileCache.setItem(tailwindcssCDNPath, data);

    tailwindCode = data;
  }

  return `
      <html>
        <head></head>
        <body>
          <div id="root"></div>
          <script>
            const handleError = (err) => {
              const root = document.querySelector('#root');
                root.innerHTML = \`
                  <div style="color:red">
                    <h4>Runtime Error</h4>
                  \` +
                  err +  
                  \`</div>\`;
                console.error(err);
            }

            ${err ? `handleError(${err})` : undefined}

            window.addEventListener('error', (event) => {
              event.preventDefault();
              handleError(event.error);
            })

            window.addEventListener('message', (event) => {
              try {
                eval(event.data);
              } catch (err) {
                console.log('poiu');
                handleError(err);
              }
            });
          </script>
          <script>${tailwindCode}</script>
        </body>
      </html>
    `;
};

export const Preview: Component<Props> = (props) => {
  let iframeRef: HTMLIFrameElement | undefined = undefined;

  createEffect(async () => {
    if (iframeRef) {
      const { code, err } = props;

      // Reset HTML iframe
      iframeRef.srcdoc = await generateIframeHTML(err);

      // Pass code into iframe (don't know why but must wait 100ms so that the HTML in iframe does not get clear)
      const timeoutId = setTimeout(() => {
        if (iframeRef) {
          iframeRef.contentWindow?.postMessage(code, "*");
        }

        clearTimeout(timeoutId);
      }, 100);
    }
  });

  return (
    <iframe class="w-full h-full" ref={iframeRef} sandbox="allow-scripts" />
  );
};
