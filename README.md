![Title Image](assets/suunta-banner.png)

# Suunta

A simple SPA routing and state management library for everyday use

**Demo**

For an interactive demo, visit [ReplIt](https://replit.com/@huhtamatias/Suunta-Sandbox)

## Table of Contents

   * [Install](#install)
   * [Usage](#usage)
      + [Dynamic routes](#dynamic-routes)
      + [State ](#state)
         - [Global State](#global-state)
      + [Requests](#requests)
      + [Named routes](#named-routes)
      + [Redirects](#redirects)
         - [Not Found -pages](#not-found-pages)
         - [Not Found -pages with redirect](#not-found-pages-with-redirect)
      + [Dynamic imports](#dynamic-imports)
      + [Rendering into outlets](#rendering-into-outlets)
      + [Sub-views](#sub-views)
      + [Hooks](#hooks)



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
import { Suunta } from "suunta";

const routes = [
    {
        path: "/",
        view: html`<p>Hello world!</p>`
    },
    {
        path: "/foo",
        view: FooView,
        title: "Example - Foo View"
    }
] as const;

// This part can be written however you want. Suunta provides you with the 
// necessary data, you handle the rendering.
const renderer = (view, route, renderTarget) => {
    render(html`${view}`, renderTarget);
};

const routerOptions = {
    routes,
    renderer,
    target: document.body
};

const router = new Suunta(routerOptions);

router.start();
```



### Dynamic routes

Suunta supports dynamic routes with the `{keyword}`-notation. 
If you want the matching to only match certain types of data, you can supply a regex for the matcher.

You can access properties of your dynamic routes with `router.getCurrentView()?.route.params?.id`

```typescript
const routes: Route[] = [
    {
        path: "/user/{id}(\\d+)",
        name: "User profile",
        view: () => html`<p>User page for id ${router?.getCurrentView()?.params.id}</p>`
    },
    {
        path: "/search/{matchAll}",
        name: "Search",
        view: html`<p>Search page for ${router?.getCurrentView()?.params.matchAll}</p>`
    },
    {
        path: "/user/{id}(\\d+)/search/{matchAll}",
        name: "User profile with search",
        view: () => html`
            <p>User page for id ${router?.getCurrentView()?.params.id}</p>
            <p>Search page for ${router?.getCurrentView()?.params.matchAll || "Nothing"}</p>
        `
    },
    {
        path: "/{notFoundPath}(.*)",
        name: "404",
        view: html`<p>Page not found</p>`
    },
];
```

### State 

A lot of views have state. And that state can change, and so should the page content with it.

For state management, Suunta provides a `createState` hook, which will take the initial state of your view as a parameter.

When any of the values of that state object is directly manipulated, the view will update accordingly.

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

#### Global State

For some use cases you might want to have state that is shared between multiple views, and is also reactive.

For these cases, the use of the `createGlobalState` hook is recommended.

**This hook should not be used to replace the `createState` hook, but to implement those features, where a shared reactive state is useful for the
productivity and efficiency of the application.**

When values of globalState objects are updated, all of the views managed by the current Suunta instance will be updated.

For most applications only using a single view at a time, this won't affect performance, but for views with 
subviews through the Child Routes, this will cause an performance hit.

```javascript
// ../index.js
import { createGlobalState } from "suunta";

export const globalState = createGlobalState({
    count: 0
})


// FooView.js
import { html } from 'lit';
import { createState } from 'suunta';
import { globalState } from "../index.js";

export const View = () => {
    const addCount = () => {
        globalState.count += 1;
    };

    return () => html`
        <p>Foo View</p>
        <p>Count: ${globalState.count}</p>
        <button @click=${addCount}>Count++</button>
    `;
};
```

### Requests

Most of modern web applications tend to handle some kind of API calls to an external service.

When managing async connections to external services, you need to manage multiple states. There's loading, errors, data etc.

Suunta comes packed with an utility class inside the `suunta/fetch` sub-package, which provides request 
state management that works with the Suunta state system.

```typescript
import { html } from "lit";
import { fetchPending, pendingApiResponse } from "suunta/fetch";

export function View() {
  const { loading, error, failed, result, reload } = pendingApiResponse(
    fetchPending<GetAllCustomerInfoResponse>("http://localhost:8080/customers"),
  );

    return () => html`
        <h2>Users</h2>

        ${loading
          ? html`<p>Loading...</p>`
          : html`
              <ul>
                ${result.customers.map(
                  (c) => html` <li>${c.firstName} ${c.lastName}</li> `,
                )}
              </ul>
        `}
    `;
}
```

The `pendingApiResponse` function works out of the box with [Hey API](https://heyapi.dev/) generated SDK's.

```typescript
import { getAllCustomerInfo } from "../hey-api/sdk.gen";

const { loading, error, failed, result, reload } = pendingApiResponse(getAllCustomerInfo);
```

There is also a out-of-the-box implementation with Suunta named `fetchPending`, which only wraps the fetch API 
and provides some simple utilities to it.

Some people however might want some more granular control over their process and want to write their own fetch wrappers.
That is also supported and encouraged by Suunta! A good starting point would be something along the lines of:

```typescript
import { RequestResult } from "suunta/fetch/core";

export function fetchPending<T>(input: RequestInfo | URL, init?: RequestInit): () => Promise<RequestResult<T>> {
  return async function () {
    const request = new Request(input, init);
    const response = await fetch(request);

    if (!response.ok) {
      const error = await response.text();
      return {
        response,
        request,
        error,
        data: undefined,
      };
    }

    const data = await response.json() as T;

    return {
      response,
      request,
      error: undefined,
      data,
    };
  };
}
```

### Named routes

With Suunta, you don't have to go through the hassle of going through your whole codebase with CTRL - F after changing a route.

You can define your routes using the `resolve` function and generate routes dynamically by the name of said route.
 
```typescript

const routes = [
    {
        name: "Home",
        path: "/",
        view: HomeView
    },
    {
        name: "UserView",
        path: "/users/{userId}",
        view: UserView
        children: [
            {
                name: "UserAttendances",
                path: "/attendances/{attendanceId}",
                view: UserAttendanceView
            }
        ]
    },
]

const homeView = router.resolve("Home");
// > homeView => /


const userView = router.resolve("UserView", 123);
// > userView => /users/123

const attendanceView = router.resolve("UserAttendances", 123, "suunta-course");
// > attendanceView => /users/123/attendances/suunta-course

html`<a href="${router.resolve("UserView", 123)}">To user view</a>`
```

If you define your routes as a constant, you will also get Typescript type hints for your routes.

```typescript
const routes = [
    {
        name: "Home",
        path: "/",
        view: HomeView
    },
    {
        name: "UserView",
        path: "/users/{userId}",
        view: UserView
        children: [
            {
                name: "UserAttendances",
                path: "/attendances/{attendanceId}",
                view: UserAttendanceView
            }
        ]
    },
] as const;

//          _________________ 
//          |Home            |
//          |UserView        |
//          |UserAttendances |
//          |________________|
router.resolve("")
```

### Redirects

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

### Dynamic imports

For cases where you have a bunch of views and want to squeeze out some extra performance from your packages, 
you can package split your code by dynamically importing your routes.

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

### Rendering into outlets

By using a `<suunta-view>` pseudoelement, you can tell Suunta to render the wanted content to a said location on page.

By default Suunta will render into the `document.body`

```html
<body>
    <suunta-view></suunta-view>
</body>
```

### Sub-views

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

### Hooks

Suunta provides lifecycle hooks to plug into the navigation phases from within your own views.

```typescript
import { html } from "lit-html";
import { createState, onNavigated, onUpdated } from "suunta";

export function HomeView() {

    const state = createState({
        count: 0
    });

    console.log("HomeView loaded");
    
    // Triggers whenever a navigation has occured
    onNavigated(() => {
        console.log("HomeView navigated to");
    });

    // Triggers whenever the current view's state object's value is updated
    // e.g. when state.count is incremented
    onUpdated((name, oldValue, newValue) => {
        console.log('Update', { name, oldValue, newValue });
    });

    return () => html`
        <button @click=${() => state.count += 1}>Clicked ${state.count} times</button>
    `;
}
```
