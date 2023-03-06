// https://open-wc.org/docs/testing/testing-package/

import { html, render } from "lit-html";
import { Suunta, SuuntaInitOptions } from "../lib/suunta";

//
export function clearRenders() {
    render(html``, document.body);
}

export function getBasicRouterSetup() {
    const routes = [
        {
            path: "/",
            name: "Home",
            view: html`<p id="needle">Hello world!</p>`
        },
        {
            path: "/foo",
            name: "Foo",
            view: html`<p id="needle">Foo bar</p>`
        }
    ];

    const routerOptions: SuuntaInitOptions = {
        routes,
        target: "body"
    };

    const router = new Suunta(routerOptions);
    return router;
}

