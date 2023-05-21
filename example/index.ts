import { html } from "lit-html";
import { Route, Suunta, SuuntaInitOptions } from "suunta";
import { View as FooView } from "./FooView";

console.log("Foo");


let router: Suunta | undefined;

const routes: Route[] = [
    {
        path: "/",
        name: "Home",
        view: html`<h2>Hello world!</h2>`
    },
    {
        path: "/foo",
        view: FooView
    },
    {
        path: "/user/{id}(\\d+)",
        name: "User profile",
        view: () => html`<p>User page for id ${router?.getCurrentView()?.properties.id}</p>`
    },
    {
        path: "/search/{matchAll}",
        name: "Search",
        view: () => html`<p>Search page for ${router?.getCurrentView()?.properties.matchAll || "Nothing"}</p>`
    },
];

const options: SuuntaInitOptions = {
    routes,
    target: "body"
};

router = new Suunta(options);

router.start();

// @ts-ignore
window.ROUTER = router;
