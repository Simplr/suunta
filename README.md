# Suunta

The new minimal footprint router.

## Install

```bash
npm install suunta
```

Suunta uses [lit-html](https://lit.dev/) for rendering it's templates. If you want to implement your own renderer, look into
installing [suunta-core](https://github.com/Simplr/suunta/tree/main/lib/core) and implementing your own renderer.

## Usage

```typescript
import { FooView } from "./foo";

const routes: Route[] = [
    {
        path: "/",
        name: "Home",
        view: html`<p>Hello world!</p>`
    },
    {
        path: "/foo",
        name: "Foo",
        view: FooView
    }
];

const routerOptions: SuuntaInitOptions = {
    routes
};

router = new Suunta(routerOptions);

router.start();
```
