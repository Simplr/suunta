import { Suunta } from "../lib/suunta";
import { SuuntaInitOptions } from "../lib/suunta";
import { expect } from '@esm-bundle/chai';
import { html } from "lit-html";
import { SuuntaView } from "../lib/view";

it("Should return a router instance", () => {

    const routerOptions: SuuntaInitOptions = {
        routes: [],
    };

    const router = new Suunta(routerOptions);

    expect(router).to.not.equal(null);
});

it("Should set current view as the currentView", () => {

    const routes = [
        {
            path: "/",
            name: "Home",
            view: html`<p>Hello world!</p>`
        }
    ];

    const routerOptions: SuuntaInitOptions = {
        routes
    };

    const currentView: SuuntaView = {
        href: "http://localhost:8080/",
        route: routes[0],
        properties: {}
    }

    const router = new Suunta(routerOptions);

    expect(router.getCurrentView()).to.equal(undefined);

    router.start();

    const actualCurrentView = router.getCurrentView();
    expect(actualCurrentView?.route).to.equal(currentView.route);
    expect(actualCurrentView?.route.properties).to.equal(currentView.route.properties);
});
