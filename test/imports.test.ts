import { expect } from "@esm-bundle/chai";
import { DEFAULT_OUTLET, clearRenders, getDynamicImportRouterSetup, navigateTo } from "./util";
import { fixture } from "@open-wc/testing";
import { render } from "lit-html";
import { FooView } from "./views/foo";
import { BarView } from "./views/bar";
import DefaultView from "./views/default";
import { Suunta, SuuntaInitOptions } from "suunta-core";
import { litRenderer } from "suunta-lit-renderer";

it("Should support dynamic imports", async () => {
    clearRenders();
    navigateTo("/foo");

    await new Promise(r => setTimeout(r, 100));

    const router = getDynamicImportRouterSetup();
    router.start();

    await new Promise(r => setTimeout(r, 100));

    const target = await fixture(DEFAULT_OUTLET);
    render(FooView(), target as HTMLElement);

    expect(target).dom.to.equal(document.querySelector("#outlet")?.outerHTML);
});

it("Should support straight imports", async () => {
    clearRenders();
    navigateTo("/bar");

    await new Promise(r => setTimeout(r, 100));

    const router = getDynamicImportRouterSetup();
    router.start();

    await new Promise(r => setTimeout(r, 100));

    const target = await fixture(DEFAULT_OUTLET);
    render(BarView(), target as HTMLElement);

    expect(target).dom.to.equal(document.querySelector("#outlet")?.outerHTML);
});

it("Should support dynamic default imports", async () => {
    clearRenders();
    navigateTo("/default");

    await new Promise(r => setTimeout(r, 100));

    const router = getDynamicImportRouterSetup();
    router.start();

    await new Promise(r => setTimeout(r, 100));

    const target = await fixture(DEFAULT_OUTLET);
    render(DefaultView(), target as HTMLElement);

    expect(target).dom.to.equal(document.querySelector("#outlet")?.outerHTML);
});

it("Should support dynamic default imports", async () => {
    clearRenders();
    navigateTo("/default");

    await new Promise(r => setTimeout(r, 100));

    const router = getDynamicImportRouterSetup();
    router.start();

    await new Promise(r => setTimeout(r, 100));

    const target = await fixture(DEFAULT_OUTLET);
    render(DefaultView(), target as HTMLElement);

    expect(target).dom.to.equal(document.querySelector("#outlet")?.outerHTML);
});

it("Should throw when imported file has no exports", async () => {
    clearRenders();
    navigateTo("/foo");
    await new Promise(r => setTimeout(r, 100));

    const ImportedView = () => import("./views/no-exports.js");

    const routerOptions: SuuntaInitOptions = {
        routes: [
            {
                path: "/foo",
                view: ImportedView
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
    expect(exceptionText).to.include("[Suunta]: Could not parse imported route.");
});


it("Should throw when imported file creates recursion", async () => {
    clearRenders();
    navigateTo("/foo");
    await new Promise(r => setTimeout(r, 100));

    const ImportedView = () => import("./views/recursion-imports.js");

    const routerOptions: SuuntaInitOptions = {
        routes: [
            {
                path: "/foo",
                view: ImportedView
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
    expect(exceptionText).to.include("[Suunta]: Could not parse route from View. Recursion level too deep.");
});
