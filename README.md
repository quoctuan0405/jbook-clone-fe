# Jbook clone SolidJS

Frontend part from [React and Typescript: Build a Portfolio Project](https://www.udemy.com/course/react-and-typescript-build-a-portfolio-project/) by [Stephen Grider](https://www.udemy.com/user/sgslo/) but use [SolidJS](https://www.solidjs.com/). Check it out [here](https://jbook-clone-fe.vercel.app/). 

*Please patiently wait for a while for the huge Javascript file to load. I do not use any SSR for the sake of simplicity.*

**Huge shout out for Stephen Grider for creating such an awesome course :tada::tada::tada:**

## Why I create this application?

As I spent quite a lot of time figuring out how to compile and run SolidJS code in the browser, I hope it would help someone out there.

Just copy the content from 3 files:

- src/bundler/plugins/fetch-plugin.ts
- src/bundler/plugins/solid-plugin.ts
- src/bundler/plugins/unpkg-path-plugin.ts

And (just for sure) update your vite.config.ts:

```
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [nodePolyfills(), solid()],
});
```

and now your can compile Solid code in the browser. Below is the detailed explanation.

## Long journey on how to run SolidJS code in the browser

### Try to compile run Solid code

After compiling React successfully using ESBuild, let's write some Solid code to see how it works:

```js
import { render } from "solid-js/web";

render(() => <div>Hi there</div>, document.querySelector("#root"));
```

You probably get this error:

> ✘ [ERROR] Request failed with status code 404 [plugin fetch-plugin]

> a:index.jsx:2:23:

> 2 │ import { render } from "solid-js/web";

<br>

The resolver try to reach out to

```
https://unpkg.com/solid-js@1.8.7/web
```

but [Unpkg](https://unpkg.com/) return an 404 not found error.

Why

```ts
import ReactDOM from "react-dom/client";
```

works just fine but

```ts
import { render } from "solid-js/web";
```

return an error?

### Using [Skypack](https://cdn.skypack.dev) instead of [Unpkg](https://unpkg.com/)

**It turns out that Unpkg expected a file called web.js inside of the main folder.**

ReactDOM have a file called client.js inside of the main folder but SolidJS does not. Instead, SolidJS have a folder called web that is a sub-project that have a package.json file point to dist/server.js. As of 28/12/2023, Unpkg does not understand this.

**We'll use Unpkg alternative called Skypack. Just change https://unpkg.com to https://cdn.skypack.dev/.**

```ts
// relative path like (./) or (../)
build.onResolve({ filter: /^\.+\// }, (args) => {
  return {
    namespace: "a",
    path: new URL(args.path, "https://cdn.skypack.dev/" + args.resolveDir + "/")
      .href,
  };
});
```

```ts
// all other cases
build.onResolve({ filter: /.*/ }, async (args) => {
  return {
    namespace: "a",
    path: `https://cdn.skypack.dev/${args.path}`,
  };
});
```

But now, you probably have a different error:

> ReferenceError: React is not defined

Why did we use Solid but have a 'React is not defined' error?

### Solid plugin for ESBuild

If you print out the compiled code, you'll see this line at the very bottom:

```js
render(
  () => /* @__PURE__ */ React.createElement("div", null, "Hi there SolidJS"),
  document.querySelector("#root")
);
```

It turns out that by default, ESBuild compile JSX to React.createElement(). Now press F12, choose Network tab, and then choose a random .tsx or .jsx file to see how Solid compile JSX:

```js
const _el$ = _tmpl$();
_$insert(
  _el$,
  _$createComponent(CodeCell, {
    input: `import { render } from "solid-js/web";

render(() => <div>Hi there SolidJS</div>, document.querySelector("#root"));`,
  })
);
```

**Solid compile JSX very differently compare to React. In order to make ESBuild compile JSX the right way, we need to install [esbuild-plugin-solid](https://github.com/amoutonbrady/esbuild-plugin-solid).**

<details>
<summary></summary>
I actually Ctrl + F and Ctrl + Shift + F to death to find that mysterious 'React' but it turns out about how ESBuild compile JSX.

I thought JSX is just a spec, not how to actually compile it. To be honest, I was quite frustrated at this point.

</details>

So let's install the plugin:

```
npm install esbuild-plugin-solid
# or
pnpm install esbuild-plugin-solid
```

Now let's add the plugin:

```ts
import { solidPlugin } from "esbuild-plugin-solid";
```

```ts
const result = await esbuild.build({
  entryPoints: ["index.jsx"],
  bundle: true,
  write: false,
  plugins: [unpkgPathPlugin(), solidPlugin(), fetchPlugin(rawCode)],
  define: { "process.env.NODE_ENV": `"production"`, global: "window" },
});
```

But now the whole dev server just crash:

> Module "path" has been externalized for browser compatibility.

> Uncaught ReferenceError: Buffer is not defined

What does all of this errors trying to tell us?

### Write our own SolidJS plugin

Let's take a look at the plugin code:

```ts
import { readFile } from "fs/promises";
import { transformAsync, TransformOptions } from "@babel/core";
// @ts-ignore
import solid from "babel-preset-solid";

...

build.onLoad({ filter: /\.(t|j)sx$/ }, async (args) => {
        const source = await readFile(args.path, { encoding: "utf-8" });

        const { name, ext } = parse(args.path);
        const filename = name + ext;

        const result = await transformAsync(source, {
          presets: [[solid, options?.solid ?? {}], [ts, options?.typescript ?? {}]],
          filename,
          sourceMaps: "inline",
          ...(options?.babel ?? {})
        });

        ...
```

This plugin try to read content from user's file using fs module then use another compiler called [babel-preset-solid](https://www.npmjs.com/package/babel-preset-solid) to compile it.

**But we can't access the file system (fs, path,... module) from the browser. That's why we see such cryptic errors.**

Luckily the plugin is simple enough for us to write our own.

<details>
<summary></summary>
After watching Stephen Grider course, I though I have a good 1000 miles bird eye general overview summary about what ESBuild is about. But after learning that you can use another compiler inside ESBuild, I suddenly don't understand all the Rollup, Vite, ESBuild, SWC is about anymore (and thus started to really contemplated about the meaning of life).

_If you Stephen Grider are reading this, I know you hate all the long boring theory (I do too), but I don't mind another video explains all the Rollup, Vite, ESBuild, SWC,... stuff is all about._

I don't know who the guy evanw (author of ESBuild) is but if one day I became the president I will force all childrens to learn his name and engrave his name into stone to forever remember his name. Damn the code of this guy is such a masterpiece that you can use Javascript to write another compiler to run inside his compiler that compiled to WASM to run inside the browser. I can't imagine if ESBuild was written in Rust like SWC how can my Javascript code an exists between all those insane lifetime, mut, lock, cell,... of Rust.

</details>

First, install [@babel/core](https://www.npmjs.com/package/@babel/core) and [babel-preset-solid](https://www.npmjs.com/package/babel-preset-solid):

```
npm i @babel/core babel-preset-solid
# or
pnpm i @babel/core babel-preset-solid
```

We'll compile the JSX in the entry file the Solid way before resolve any further import.

```ts
import * as esbuild from "esbuild-wasm";
// @ts-ignore
import { transform } from "@babel/core";
// @ts-ignore
import babelPresetSolid from "babel-preset-solid";

export const solidPlugin = (inputCode: string): esbuild.Plugin => {
  return {
    name: "plugin-solid",
    setup: (build) => {
      build.onLoad({ filter: /(^index\.jsx$)/ }, async () => {
        const { code } = transform(inputCode, {
          presets: [[babelPresetSolid, { generate: "dom", hydratable: false }]],
        });
        return {
          loader: "js",
          contents: code || undefined,
        };
      });
    },
  };
};
```

Let's add the plugin to esbuild:

```ts
const result = await esbuild.build({
  entryPoints: ["index.jsx"],
  bundle: true,
  write: false,
  plugins: [solidPlugin(rawCode), unpkgPathPlugin(), fetchPlugin(rawCode)],
  define: { "process.env.NODE_ENV": `"production"`, global: "window" },
});
```

**Remember to put the custom solidPlugin first, order does matter here**

Now the application is back up, but if you click the submit button:

> Module "path" has been externalized for browser compatibility.

> ✘ [ERROR] \_path(...).resolve is not a function [plugin plugin-solid]

> Error: Build failed with 1 error: <br/>
> error: \_path(...).resolve is not a function

> Uncaught ReferenceError: process is not defined

We still have the same errors as before. Again the errors tell us we can't access the fs, path,... module from the browser. But why is that?

### Using [@babel/standalone](https://www.npmjs.com/package/@babel/standalone)

**[@babel/core](https://www.npmjs.com/package/@babel/core) is for the Node environment. To run babel in the browser use [@babel/standalone](https://www.npmjs.com/package/@babel/standalone)**

So let's install [@babel/standalone](https://www.npmjs.com/package/@babel/standalone):

```
npm i @babel/standalone
# or
pnpm i @babel/standalone
```

then install its types:

```
npm i --save-dev @types/babel__standalone
# or
pnpm i --save-dev @types/babel__standalone
```

Change the @babel/core to @babel/standalone

```ts
-- import { transform } from "@babel/core";

++ import { transform } from "@babel/standalone";
```

And voila it works!

<details>
  <summary>If it still does not work (like me), click here.</summary>
  
  We have resolved the majority of errors, but still left with:

> Uncaught ReferenceError: process is not defined

Why is that?

### Handling node global variable

If you click on the link to see which the part of code that cause an error, you probably see something like this:

```js
...
default: !process.env.BABEL_TYPES_8_BREAKING ? [] : void 0
...
```

This is a simple one, let's handle it like Stephen Grider did with global variables on ESBuild.

Go to vite.config.ts and add:

```ts
export default defineConfig({
  define: {
    "process.env.BABEL_TYPES_8_BREAKING": "true",
    "process.versions.node": "'19.3.0'",
  },
  ...
});
```

But there is the same old error:

> Uncaught ReferenceError: Buffer is not defined

> \_assert is not a function

### Using [vite-plugin-node-polyfills](https://www.npmjs.com/package/vite-plugin-node-polyfills)

Despite its name, @babel/standalone still use some module like assert, buffer,... that only exists in the Node environment.

To expose / use the same module in the browser, we need to use node polyfills library (as far as I under stand, polyfills mean that transform your code and add necessary namespace, module,... so that the browser or all the older version of it that use older syntax version of Javascript can undertand your modern code).

Since we use Vite, let's add [vite-plugin-node-polyfills](https://www.npmjs.com/package/vite-plugin-node-polyfills) to our project

```
npm i vite-plugin-node-polyfills
# or
pnpm i vite-plugin-node-polyfills
```

Now use the plugin in the vite.config.ts file:

```ts
export default defineConfig({
  define: {
    "process.env.BABEL_TYPES_8_BREAKING": "true",
    "process.versions.node": "'19.3.0'",
  },
  plugins: [nodePolyfills(), solid()],
});
```

And now it's actually works!

But [vite-plugin-node-polyfills](https://www.npmjs.com/package/vite-plugin-node-polyfills) also handle all the process module for us, so we can remove the environment variable line:

```ts
export default defineConfig({
  plugins: [nodePolyfills(), solid()],
});
```

</details>

### And back to React...

Yay now the Solid code works, now let's remove the solid plugin

```ts
const result = await esbuild.build({
  entryPoints: ["index.jsx"],
  bundle: true,
  write: false,
  plugins: [unpkgPathPlugin(), fetchPlugin(rawCode)],
  define: { "process.env.NODE_ENV": `"production"`, global: "window" },
});
```

and run some React code:

```ts
import React from "react";
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.querySelector("#root")).render(
  <div>Hi there ReactJS</div>,
);
```

And we get this error:

> GET https://cdn.skypack.dev//-/react-dom@v17.0.1-oZ1BXZ5opQ1DbTh7nu9r/dist=es2019,mode=raw/client 404 (Not Found)

> ✘ [ERROR] Request failed with status code 404 [plugin fetch-plugin]

Now it's [Skypack](https://www.skypack.dev/) turn can't find react-dom/client???

### Use [Skypack](https://www.skypack.dev/) for Solid, [Unpkg](https://unpkg.com/) for React

If you go to https://unpkg.com/browse/react-dom@17.0.1, turns out React DOM version 17.0.1 does not the client.js file or client folder. So why Skypack mistakingly redirect us to React DOM version 17.0.1?

Since a lot of legacy application still import React from Skypack without specify version, so Skypack lock React and React DOM to version 17 to prevent breaking change. Read more about it [here](https://github.com/skypackjs/skypack-cdn/issues/88).

So how about we specify React version when import using Skypack?

```ts
import ReactDOM from "react-dom/client@18.2.0";
```

We get back the 404 Not Found error:

> GET https://cdn.skypack.dev//-/react-dom@v17.0.1-oZ1BXZ5opQ1DbTh7nu9r/dist=es2019,mode=raw/client 404 (Not Found)

If you look at the Request initiator chain:

> https://cdn.skypack.dev/react-dom/client@18.2.0

> https://cdn.skypack.dev//-/react-dom@v17.0.1-oZ1BXZ5opQ1DbTh7nu9r/dist=es2019,mode=raw/client

Till this day (28/12/2023), Skypack still does not fix the React lock version issue.

So let's use [Skypack](https://www.skypack.dev/) for Solid, [Unpkg](https://unpkg.com/) for React.

### Handling the import 'solid-js' line

If we meet any import that start with 'solid-js' (eg 'solid-js/web'), let's download it from [Skypack](https://www.skypack.dev/).

On the solid plugin, let's add another onResolve:

```ts
setup: (build) => {
      // using skypack to load solid.js
      build.onResolve({ filter: /^solid-js/ }, (args) => {
        return {
          namespace: "a",
          path: new URL(
            args.path,
            "https://cdn.skypack.dev/" + args.resolveDir + "/"
          ).href,
        };
      });
      ...
```

### Handling all the 'child' import recursively

On the unpkg-path-plugin, if we found an import that from Skypack, keep using Skypack, if we found an import from Unpkg, keep using Unpkg. But how can we detect the base url of each import?

Luckily we have `args.importer`.

Let's change the unpkg-path-plugin to:

```ts
// relative path like (./) or (../)
build.onResolve({ filter: /^\.+\// }, (args) => {
  if (args.importer.indexOf("cdn.skypack.dev") !== -1) {
    // If the importer is skypack, keep using skypack
    return {
      namespace: "a",
      path: new URL(
        args.path,
        "https://cdn.skypack.dev/" + args.resolveDir + "/"
      ).href,
    };
  } else {
    // If the importer is unpkg, keep using unpkg
    return {
      namespace: "a",
      path: new URL(args.path, "https://unpkg.com" + args.resolveDir + "/")
        .href,
    };
  }
});

// all other cases
build.onResolve({ filter: /.*/ }, async (args) => {
  if (args.importer.indexOf("cdn.skypack.dev") !== -1) {
    // If the importer is skypack, keep using skypack
    return {
      namespace: "a",
      path: `https://cdn.skypack.dev/${args.path}`,
    };
  } else {
    return {
      // If the importer is unpkg, keep using unpkg
      namespace: "a",
      path: `https://unpkg.com/${args.path}`,
    };
  }
});
```

And now all our plugins work correctly!

### How I use TailwindCSS inside iframe

TailwindCSS have a guide on how to use the [Play CDN](https://tailwindcss.com/docs/installation/play-cdn) to run Tailwind directly on the browser.

However it's:

- Can't install unofficial plugins
- Not suit for production, for playground only

In fact, if you try to use that CDN, you might see this warning from the console:

> cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation

I think TailwindCSS don't want us to use this in production because:

- Performance problem
- Tailwind **don't** want us to use their CDN for **free**

But for this application, I think it's actually fine to use Tailwind Play CDN inside that iframe. After all, this is **exactly** a playground. And if Tailwind don't want people to spam their CDN, let's just download their scripts and host our own.

Add a script (in the `preview` component) to link to their CDN like this:

```ts
const html = `
  <html>
    <head></head>
    <body>
      <div id="root"></div>
      <script>...</script>
      <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio"></script>
    </body>
  </html>
`;
```

<details>
  <summary>I tried to actually run TailwindCSS on the browser but...</summary>

...I'm so exhausted.

I have gone so far with all the solid babel node polyfills stuff, but I gave up after saw this:

```js
const _fs = /*#__PURE__*/ _interop_require_default(require("fs"));
const _path = /*#__PURE__*/ _interop_require_wildcard(require("path"));
const _postcss = /*#__PURE__*/ _interop_require_default(require("postcss"));
const _createUtilityPlugin = /*#__PURE__*/ _interop_require_default(require("./util/createUtilityPlugin"));
const _buildMediaQuery = /*#__PURE__*/ _interop_require_default(require("./util/buildMediaQuery"));
const _escapeClassName = /*#__PURE__*/ _interop_require_default(require("./util/escapeClassName"));
const _parseAnimationValue = /*#__PURE__*/ _interop_require_default(require("./util/parseAnimationValue"));
const _flattenColorPalette = /*#__PURE__*/ _interop_require_default(require("./util/flattenColorPalette"));
...
```

TailwindCSS use fs module to import a **dozens** of it's internal files. Even I had been able to somehow cheat the browser on the fs module, I still have to expose a tons of dozens of files for Tailwind to import it. No polyfills can deal with fs module, I have to come up with my own solution to handle that.

There's actually a guy capable of doing all of that. Check it out at: https://github.com/beyondcode/tailwindcss-jit-cdn.

But after spent 5 hours trying I'm so exhausted. I gave up at this point.

</details>

### How I use Monaco Editor with Solid?

I found a package for Solid here: https://www.npmjs.com/package/monaco-editor-solid.

But unlike to React, Solid actually works very well with 'normal', 'native' Javascript library/package. You don't have to find some 'solid-' version of the library to use.

So let's use Monaco Editor like a normal Javascript package. The only problem is how you can load all languages and packages necessary for Monaco Editor to run using Vite.

I found a plugin called [vite-plugin-monaco-editor](https://www.npmjs.com/package/vite-plugin-monaco-editor) to use Monaco Editor with Vite.

Let's import it to our project:

```
npm install --save-dev vite-plugin-monaco-editor

// or
pnpm install --save-dev vite-plugin-monaco-editor

// or
yarn add vite-plugin-monaco-editor -D
```

Next, let's add to vite.config.ts:

```ts
import monacoEditorPluginModule from "vite-plugin-monaco-editor";

export default defineConfig({
  plugins: [nodePolyfills(), solid(), monacoEditorPlugin({})],
});
```

<details>
<summary></summary>
This package last updated was 1 year ago and have some typings problems that the author still not fix. I tried to study how Monaca Editor load under the hood but I'm too exhausted at this point.
</details>

### How I'm **not** able to use Typescript with Monaco Editor

I found a library that auto download and resolve typings from Unpkg like what we write all the plugin: https://github.com/lukasbach/monaco-editor-auto-typings.

But as of 28/12/2023, if you go to the demo website page, it... failed to load the typings for React. Check the still continued issue here: https://github.com/lukasbach/monaco-editor-auto-typings/issues/40.

So I tried to read the docs and came up with another way.

In order to use Typescript with Intellisense, Monaco Editor want us to provide .d.ts file something like below:

```ts
monaco?.languages.typescript.javascriptDefaults.addExtraLib(
  LODASH_index,
  "@types/lodash/index.d.ts"
);
```

I thought it was an easy task, just get a .d.ts file from Unpkg and feed it to the Monaco Editor. But it turns out a .d.ts file can import _another_ .d.ts file.

```typescript
import * as CSS from "csstype";
import * as PropTypes from "prop-types";
```

So we need to use ESBuild to bundle it all up and feed the Monaco Editor. But unfortunately:

> SyntaxError: Missing semicolon.

>                        v

> type NativeAnimationEvent = AnimationEvent;

ESBuild just straight up refuse to bundle and compile .d.ts file.

Furthermore, if you right click to open the `csstype` file above, oh boy you will find an 800kb file .d.ts file nested deep inside some obscure folder from Admin user in the C:// drive from some long forgotten version of Typescript.

In order to load just the type definition for React, we probably need to send 2Mb worth of data to the users.

I found a [video](https://www.youtube.com/watch?v=Gc9-7PBqOC8) teach how to write a HelloWorld bundler from scratch but I'm too exhausted to build that.

_If you Stephen Grider are reading this, I don't mind if you make a Rust course teaching how to write a custom bundler or just update your Golang course on how to use WASM. As for Rust, I don't understand lessons came from a long history with C that lead to all the Rust rules._

<details>
<summary></summary>

_Currently it seems there are no good hands-on course teaching how to use Rust out there. As just another regular Javascript developer, no matter how much I watch Primagen or Jon Gjengset, I always feel like Rust is for the elites, not for a regular guy like me._

_Half of the time trying to learn Rust I scream at the borrow checker at my screen:_

- _"Why you always teach me your f\*\*\*ing stupid rule without showing what the lessons you learned along the way with C that lead to this rule???"_
- _"Can you write me some code that just violate one of your stupid rules and somehow lead to consequences?"_
- _"And how the f\*\*\* can I write code that even just remotely follow 2 of your thousands rules that can lead to memory corruption???"_
</details>

### Why I build this app with Solid?

I really like Solid because:

- You can stop worrying about all the insane lifecycle of components. It means that your code would contains **less bug** (like the infinite loop with `useEffect`)
- You can **easily integrate** other 'native', 'normal' Javascript package/library without need to find a 'react-' one
- You can just code a crazy form that **have 120 input fields** without having to worried about performance (and dealing with all the hidden bugs of React Form Hook)
- You can stop worry about `useMemo`, `useCallback`, `useRef`,... Solid `just work fast` without all the insane hooks meant for performance.
- You do **not** need to throw away all the muscle memory and knowledge you have learned about React

<details>
<summary></summary>

If author of Solid JS are reading this, I hope you make a blog or an article or a page of document about how to use React inside Solid. I want an official tutorial/post/docs on how to integrate a large part/component of my application in React within Solid.

I'm not asking for a insane solution like render React component inside Solid component inside React component or something crazy like that.

I see in the docs you recommended [react-solid-bridge](https://www.npmjs.com/package/react-solid-bridge) but it was last published something like 2 years ago and have some typings problem.

Most React libraries have alternatives or can be just easily written using Solid/Vanilla Javascript. But there are cases such as [React Three Drei](https://github.com/pmndrs/drei) that probably just not make sense to rewrite hundreds of thousands of line of code in Solid/Vanilla JS.

I understand that you have lot of important stuff do do like `solid-start` but I'd be very appreciate if you release of somewhat official solution to address this problem (so that a regular React developer like me don't have to worry about start using your library).

</details>

### That's all

> I hope you have fun, I know I did _(not)_

**Josh from Let's game it out**, <br/>
_[italic and the word (not) is mine]_

[Outro music of LGIO](https://www.youtube.com/watch?v=Mf9WroOPCwI)
