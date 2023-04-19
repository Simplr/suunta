import { expect } from "@esm-bundle/chai";
import { DEFAULT_OUTLET, clearRenders, getDynamicImportRouterSetup, navigateTo } from "./util";
import { fixture, html } from "@open-wc/testing";
import { render } from "lit-html";
import { FooView } from "./views/foo";
import { BarView } from "./views/bar";
import DefaultView from "./views/default";

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