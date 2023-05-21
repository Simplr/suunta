# Suunta Core

A core package for the Suunta router library. Does not include any dependencies and requires a renderer to be setup.

For a batteries included version, use `suunta`

### Usage

#### Install Suunta Core 

```bash
npm install suunta-core
```

#### Setup a custom renderer

```javascript
import { render, html } from "lit-html";

export function litRenderer(viewToRender, route, renderTarget) {
    render(html`${viewToRender}`, renderTarget);
}
```

#### Enable the renderer with Suunta core


```typescript
const routerOptions: SuuntaInitOptions = {
    routes,
    target: "#outlet",
    renderer: litRenderer
};

router = new Suunta(routerOptions);
return router;
```


