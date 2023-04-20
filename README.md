# suunta
The new router

## Usage

### Basic example


```typescript
import { html } from "lit-html";
import { Suunta, SuuntaInitOptions, Route } from "suunta";

const routes: Route[] = [
      {
          path: "/",
          name: "Home",
          view: html`<p id="needle">Hello world!</p>`
      }
  ];

const routerOptions: SuuntaInitOptions = {
    routes,
    target: "body"
};

const router = new Suunta(routerOptions);
```


### Supports imported and lazy-loaded views

```typescript
import { html } from "lit-html";
import { Suunta, SuuntaInitOptions, Route } from "suunta";
import { BarView } from "./views/bar";

const FooView = () => import("./views/foo.js");

const routes: Route[] = [
      {
          path: "/",
          name: "Home",
          view: html`<p id="needle">Hello world!</p>`
      },
      {
          path: "/foo",
          name: "Foo",
          view: FooView
      },
      {
          path: "/bar",
          name: "Bar",
          view: BarView
      }
  ];

const routerOptions: SuuntaInitOptions = {
    routes,
    target: "#outlet"
};

const router = new Suunta(routerOptions);
```

## Install

```bash
npm install suunta
```
