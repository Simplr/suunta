// https://open-wc.org/docs/testing/testing-package/

import { html, render } from "lit-html";
import { Route } from "../lib/route";
import { Suunta, SuuntaInitOptions } from "../lib/suunta";

//
export function clearRenders() {
    render(html``, document.body);
}

export function getBasicRouterSetup() {
    const routes: Route[] = [
        {
            path: "/",
            name: "Home",
            view: html`<p id="needle">Hello world!</p>`
        },
        {
            path: "/foo",
            name: "Foo",
            view: html`<p id="needle">Foo bar</p>`
        },
        {
            path: "/user",
            name: "User",
            view: html`<p>User page</p>`
        },
        {
            path: "/user/{id}(\\d+)",
            name: "User profile",
            view: html`<p>User page</p>`
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
        target: "body"
    };

    const router = new Suunta(routerOptions);
    return router;
}

