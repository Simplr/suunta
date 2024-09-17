import { render } from 'https://esm.sh/preact@10.7.2';
import { html } from 'https://esm.sh/htm@3.0.4/preact';
import { App } from "./app.js";
import { Suunta } from "suunta";

const routes = [
    {
        name: "Home",
        path: "/",
        view: App
    },
    {
        name: "Secondary",
        path: "/secondary",
        view: () => import("./secondary.js")
    }
]

function renderer(view, route, renderTarget) {
    render(html`${view}`, renderTarget);
}

const suuntaOptions = {
    routes,
    renderer,
    target: "body"
};

const router = new Suunta(suuntaOptions);

router.start();
