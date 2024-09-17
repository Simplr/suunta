import { html, render } from "lit-html";
import { Route, Suunta, SuuntaInitOptions, SuuntaTarget } from "suunta";
import { View as FooView } from "./FooView";

console.log("Foo");


export let router: Suunta | undefined;

const routes: Route[] = [
    {
        path: "/",
        name: "Home",
        view: html`<h2>Hello world!!</h2> <a href="/foo">Foo</a>`
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
    {
        path: "/user/{id}(\\d+)/search/{matchAll}",
        name: "User profile with search",
        view: () => html`
            <p>User page for id ${router?.getCurrentView()?.properties.id}</p>
            <p>Search page for ${router?.getCurrentView()?.properties.matchAll || "Nothing"}</p>
        `
    },
];

const renderer = (view: unknown, route: Route, renderTarget: SuuntaTarget) => {
    render(html`${view}`, renderTarget);
}

const options: SuuntaInitOptions<Route> = {
    routes,
    renderer,
    target: "body"
};

router = new Suunta(options);

router.start();

// @ts-ignore
window.ROUTER = router;


