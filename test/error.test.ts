import { expect } from "@esm-bundle/chai";
import { clearRenders, navigateTo } from "./util";
import { html } from "@open-wc/testing";
import { Suunta, SuuntaInitOptions } from "suunta-core";
import { litRenderer } from "suunta-lit-renderer";

it("Should throw on missing navigation route", async () => {
    clearRenders();
    navigateTo("/foo");
    await new Promise(r => setTimeout(r, 100));

    const routerOptions: SuuntaInitOptions = {
        routes: [],
        target: "body",
        renderer: litRenderer
    };

    const router = new Suunta(routerOptions);

    let success = false;
    let exceptionText = "";
    try {
        await router.start();
        success = true;
    } catch (ex) {
        exceptionText = (ex as Error).message;
    }
    expect(success).to.be.false;
    expect(exceptionText).to.include("[Suunta]: Could not find a route to navigate to, and no fallback route was set.");
});

it("Should throw on missing target", async () => {
    clearRenders();
    navigateTo("/foo");
    await new Promise(r => setTimeout(r, 100));

    const routerOptions: SuuntaInitOptions = {
        routes: [
            {
                path: "/foo",
                view: html``
            }
        ],
        renderer: litRenderer
    };

    const router = new Suunta(routerOptions);

    let success = false;
    let exceptionText = "";
    try {
        await router.start();
        await new Promise(r => setTimeout(r, 1000));
        success = true;
    } catch (ex) {
        exceptionText = (ex as Error).message;
    }
    expect(success).to.be.false;
    expect(exceptionText).to.include("[Suunta]: No router target nor a outlet tag was set.");
});

it("Should throw when target selector doesn't hit an element", async () => {
    clearRenders();
    navigateTo("/foo");
    await new Promise(r => setTimeout(r, 100));

    const routerOptions: SuuntaInitOptions = {
        routes: [
            {
                path: "/foo",
                view: html``
            }
        ],
        target: "foobar",
        renderer: litRenderer
    };

    const router = new Suunta(routerOptions);

    let success = false;
    let exceptionText = "";
    try {
        await router.start();
        await new Promise(r => setTimeout(r, 1000));
        success = true;
    } catch (ex) {
        exceptionText = (ex as Error).message;
    }
    expect(success).to.be.false;
    expect(exceptionText).to.include("[Suunta]: Can't find a router target");
});

it("Should throw getQuery is called without a name and path", async () => {
    clearRenders();
    navigateTo("/foo");
    await new Promise(r => setTimeout(r, 100));

    const routerOptions: SuuntaInitOptions = {
        routes: [
            {
                path: "/foo",
                view: html``
            }
        ],
        target: "body",
        renderer: litRenderer
    };

    const router = new Suunta(routerOptions);

    let success = false;
    let exceptionText = "";
    try {
        router.getRoute({});
        await new Promise(r => setTimeout(r, 100));
        success = true;
    } catch (ex) {
        exceptionText = (ex as Error).message;
    }
    expect(success).to.be.false;
    expect(exceptionText).to.include("[Suunta]: RouteQueryObject must contain either a name or a path");
});

it("Should throw when redirect is pointed at a missing route", async () => {
    clearRenders();
    navigateTo("/redirect");
    await new Promise(r => setTimeout(r, 100));

    const routerOptions: SuuntaInitOptions = {
        routes: [
            {
                path: "/redirect",
                redirect: "bar"
            }
        ],
        target: "body",
        renderer: litRenderer
    };

    const router = new Suunta(routerOptions);

    let success = false;
    let exceptionText = "";
    try {
        await router.start();
        await new Promise(r => setTimeout(r, 1000));
        success = true;
    } catch (ex) {
        exceptionText = (ex as Error).message;
    }
    expect(success).to.be.false;
    expect(exceptionText).to.include("[Suunta]: Could not redirect to route");
});

it("Should throw on missing renderer", async () => {
    clearRenders();
    navigateTo("/foo");
    await new Promise(r => setTimeout(r, 100));

    const routerOptions: SuuntaInitOptions = {
        target: "body",
        routes: [
            {
                path: "/foo",
                view: html``
            }
        ],
        renderer: undefined
    };


    let success = false;
    let exceptionText = "";
    try {
        const router = new Suunta(routerOptions);
        await router.start();
        await new Promise(r => setTimeout(r, 1000));
        success = true;
    } catch (ex) {
        exceptionText = (ex as Error).message;
    }
    expect(success).to.be.false;
    expect(exceptionText).to.include("[Suunta]: No renderer set! Set a router in the Suunta initialization options or use the `suunta` -package with the default Lit renderer.");
});
