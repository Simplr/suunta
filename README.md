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



### Dynamic routes

```typescript
const routes: Route[] = [
    {
        path: "/",
        name: "Home",
        view: html`<p id="needle">Hello world!</p>`
    },
    {
        path: "/user",
        name: "User",
        view: html`<p>User page</p>`
    },
    {
        path: "/user/{id}(\\d+)",
        name: "User profile",
        view: () => html`<p>User page for id ${router?.getCurrentView()?.properties.id}</p>`
    },
    {
        path: "/search/{matchAll}",
        name: "Search",
        view: html`<p>Search page for ${router?.getCurrentView()?.properties.matchAll}</p>`
    },
    {
        path: "/{notFoundPath}(.*)",
        name: "404",
        view: html`<p>Page not found</p>`
    },
    {
        path: "/redirect",
        name: "Redirect",
        redirect: "Foo"
    }
];

const routerOptions: SuuntaInitOptions = {
    routes,
    target: "#outlet",
    renderer: litRenderer
};

router = new Suunta(routerOptions);
return router;
```

