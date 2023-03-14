import { Suunta } from "../lib/suunta";
import { SuuntaInitOptions } from "../lib/suunta";
import { expect } from '@esm-bundle/chai';
import { html, render } from "lit-html";
import { SuuntaView } from "../lib/view";
import { Route } from "../lib/route";
import { clearRenders, getBasicRouterSetup } from "./util";

it("Should return a router instance", () => {
    clearRenders();
    const routerOptions: SuuntaInitOptions = {
        routes: [],
        target: "body"
    };

    const router = new Suunta(routerOptions);

    expect(router).to.not.equal(null);
    expect(router instanceof Suunta).to.be.true;
});

it("Should set current view as the currentView", () => {
    clearRenders();
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

it("Should render the HTML view", () => {
    const router = getBasicRouterSetup();

    router.start();

    const body = document.querySelector("body");
    const needle = body?.querySelector("#needle");

    expect(needle).to.not.be.null;
});

it("Should render the HTML view inside the BODY element", () => {
    clearRenders();

    const routes = [
        {
            path: "/",
            name: "Home",
            view: html`<p id="needle">Hello world!</p>`
        }
    ];

    const routerOptions: SuuntaInitOptions = {
        routes,
        target: "body"
    };

    const router = new Suunta(routerOptions);

    router.start();

    const body = document.querySelector("body");
    const needle = body?.children.namedItem("needle");

    expect(needle).to.not.be.null;
});

it("Should render the HTML view inside the div[id='target-div'] element", () => {
    clearRenders();
    render(html``, document.body);

    const targetDiv = document.createElement("div");
    targetDiv.id = "target-div";
    document.body.appendChild(targetDiv);

    const routes = [
        {
            path: "/",
            name: "Home",
            view: html`<p id="needle">Hello world!</p>`
        }
    ];

    const routerOptions: SuuntaInitOptions = {
        routes,
        target: "#target-div"
    };

    const router = new Suunta(routerOptions);

    const targetDivOnBody = document.querySelector("div[id='target-div']");

    router.start();


    const needle = targetDivOnBody?.querySelector("#needle");
    expect(needle).to.not.be.null;

    const needleInBodyChildren = document.body?.children.namedItem("needle");
    const needleInDivChildren = targetDivOnBody?.children.namedItem("needle");

    expect(needleInBodyChildren).to.be.null;
    expect(needleInDivChildren).to.not.be.null;
});
