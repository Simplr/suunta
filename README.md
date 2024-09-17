# Suunta

A simple SPA routing and state management library for everyday use

## Install

```bash
npm install suunta
```

## Usage

Suunta doesn't pack any dependencies, and therefore doesn't bring it's own rendering library either.

The easiest way to get started is to install [lit](https://lit.dev/) and create a renderer with that as shown below.

```typescript
import { FooView } from "./foo";
import { html, render } from "lit";

const routes: Route[] = [
    {
        path: "/",
        view: html`<p>Hello world!</p>`
    },
    {
        path: "/foo",
        view: FooView
    }
];

const routerOptions: SuuntaInitOptions = {
    routes
};

const renderer = (view, route, renderTarget) => {
    render(html`${view}`, renderTarget);
};

router = new Suunta(routerOptions);

router.start();
```



### Dynamic routes

Suunta supports dynamic routes with the `{keyword}`-notation. If you want the matching to only match certain types of data, you can supply a regex for the matcher.

You can access properties of your dynamic routes with `router.getCurrentView()?.route.properties?.id`

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
        path: "/user/{id}(\\d+)/search/{matchAll}",
        name: "User profile with search",
        view: () => html`
            <p>User page for id ${router?.getCurrentView()?.properties.id}</p>
            <p>Search page for ${router?.getCurrentView()?.properties.matchAll || "Nothing"}</p>
        `
    },
    {
        path: "/{notFoundPath}(.*)",
        name: "404",
        view: html`<p>Page not found</p>`
    },
    {
        path: "/redirect",
        name: "Redirect",
        redirect: "Home"
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

### State 

A lot of views have state. And that state can change, and so should the page content with it.

For state management, Suunta provides a `createState` hook, which will take the initial state of your view as a parameter.

When any of the values of that state object is directly manipulated, the view will update accordingly.

**Note: In it's current state, pushing items onto objects or arrays might or might not add reactivity to said properties**

```typescript
import { html } from 'lit';
import { createState } from 'suunta';

export const View = () => {
    const state = createState({
        count: 0,
    });

    const addCount = () => {
        state.count += 1;
    };

    return () => html`
        <p>Foo View</p>
        <p>Count: ${state.count}</p>
        <button @click=${addCount}>Count++</button>
    `;
};
```

#### Redirects

Supplying redirects is as easy as adding a `redirect` property onto your route, and targetting another view by `name` with it.

```typescript
const routes: Route[] = [
    {
        path: "/",
        name: "Home",
        view: html`<p id="needle">Hello world!</p>`
    },
    {
        path: "/redirect",
        name: "Redirect",
        redirect: "Home"
    }
]
```

#### Not Found -pages

Providing a 404 page for you application is done by creating a all-matching wildcard route, and placing it at the bottom of your route list.

```typescript
const routes: Route[] = [
    {
        path: "/",
        name: "Home",
        view: html`<p id="needle">Hello world!</p>`
    },
    {
        path: "/{notFoundPath}(.*)",
        name: "404",
        view: html`<p>Page not found</p>`
    },
]
```

#### Not Found -pages with redirect

You can also make your 404 pages a redirect

```typescript
const routes: Route[] = [
    {
        path: "/",
        name: "Home",
        view: html`<p id="needle">Hello world!</p>`
    },
    {
        path: "/{notFoundPath}(.*)",
        name: "404",
        redirect: "Home"
    },
]
```

#### Dynamic imports

For cases where you have a bunch of views and want to squeeze out some extra performance from your packages, you can package split your code by dynamically importing your routes.

Suunta will handle the rest.

```typescript
// ./views/foo.js
import { html } from "lit";

export const FooView = () => html`<p id="needle">
    Foo bar
</p>`;

// router.js
import { BarView } from "./views/bar.js";

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
    },
];

const routerOptions: SuuntaInitOptions = {
    routes,
    target: "#outlet"
};

router = new Suunta(routerOptions);
```

#### Rendering into outlets

By using a `<suunta-view>` pseudoelement, you can tell Suunta to render the wanted content to a said location on page.

```html
<body>
    <suunta-view></suunta-view>
</body>
```

#### Sub-views

The `<suunta-view>` outlet can be especially useful for rendering sub-views. If you want your view to have a navigatable sub-view, meaning that you want the view to render, without it un-rendering the previous view,
you can do that utilizing the suunta-view element and `child routes`

```typescript
const routes: Route[] = [
    {
        path: '/',
        name: 'Home',
        view: HelloView    
    },
    {
        path: '/sub',
        view: SubView,
        children: [
            {
                path: '/sub',
                view: SubView,
                children: [
                    {
                        path: '/sub',
                        view: SubView,
                        children: [
                            {
                                path: '/sub',
                                view: SubViewFloor,
                            },
                        ],
                    },
                ],
            },
        ],
    },
}

export function SubView() {
    return () => html`
        <p>
            This is a view. By adding a child view to this view, and appending a
            <code>&ltsuunta-view&gt</code> container into it, we can render subviews
        </p>

        <a href="${window.location.href}/sub">Deeper</a>

        <suunta-view></suunta-view>
    `;
}
```

By navigating to `/sub/sub/sub/sub`, we get a DOM looking like this:

```html
<body>
    <p>This is a view...</p>

    <a href="/sub/sub">Deeper</a>

    <suunta-view>
        <p>This is a view...</p>

        <a href="/sub/sub/sub">Deeper</a>

        <suunta-view>
            <p>This is a view...</p>

            <a href="/sub/sub/sub/sub">Deeper</a>

            <suunta-view>
                <p>This is a subview floor</p>
            </suunta-view>

        </suunta-view>

    </suunta-view>
</body>
```

And when navigating backwards, only the subviews are un-rendered. The whole page does not require a refresh.

#### Hooks

Suunta provides some hooks to hook into your navigating experience

```typescript
onNavigated(() => {
    // Triggers whenever a navigation has occured
});

// Triggers whenever the current view's state object's value is updated
onUpdated((name, oldValue, newValue) => {
    console.log('Update', { name, oldValue, newValue });
});
```
