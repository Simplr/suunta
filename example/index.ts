import { html } from "lit-html";
import { Route, Suunta, SuuntaInitOptions } from "suunta";
import { View as FooView } from "./FooView";

console.log("Foo");


const routes: Route[] = [
    {
        path: "/",
        name: "Home",
        view: html`<h2>Hello world!</h2>`
    },
    {
        path: "/foo",
        view: FooView
    }
];

const options: SuuntaInitOptions = {
    routes,
    target: "body"
};

const router = new Suunta(options);

router.start();
