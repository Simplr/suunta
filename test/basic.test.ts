import { Suunta } from "../lib/suunta";
import { SuuntaInitOptions } from "../lib/suunta";
import { expect } from '@esm-bundle/chai';
import { html } from "lit-html";
import { SuuntaView } from "../lib/view";
import { Route } from "../lib/route";

// https://open-wc.org/docs/testing/testing-package/

function getBasicRouterSetup() {
    const routes = [
        {
            path: "/",
            name: "Home",
            view: html`<p>Hello world!</p>`
        }
    ];

    const routerOptions: SuuntaInitOptions = {
        routes,
        target: "body"
    };

    const router = new Suunta(routerOptions);
    return router;
}

it("Should return a router instance", () => {
    const routerOptions: SuuntaInitOptions = {
        routes: [],
        target: "body"
    };

    const router = new Suunta(routerOptions);

    expect(router).to.not.equal(null);
});

it("Should set current view as the currentView", () => {
    const router = getBasicRouterSetup();

    const currentView: SuuntaView = {
        href: "http://localhost:8080/",
        route: router.routes.get("/") as Route,
        properties: {}
    }

    expect(router.getCurrentView()).to.equal(undefined);

    router.start();

    const actualCurrentView = router.getCurrentView();
    expect(actualCurrentView?.route).to.equal(currentView.route);
    expect(actualCurrentView?.route.properties).to.equal(currentView.route.properties);
});

it("Should set current view as the currentView", () => {
    const router = getBasicRouterSetup();

    router.start();

    const body = document.querySelector("body");
    console.log(body);
});
