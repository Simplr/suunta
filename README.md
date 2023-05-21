# Suunta

The new minimal footprint router.

## Install

```bash
npm install suunta
```

## Usage

```typescript
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
```
