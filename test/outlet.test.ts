import { expect } from "@esm-bundle/chai";
import { DEFAULT_OUTLET, clearRenders, getBasicRouterSetup, getDynamicImportRouterSetup, getOutletSetup, navigateTo } from "./util";
import { fixture, html } from "@open-wc/testing";
import { render } from "lit-html";
import { FooView } from "./views/foo";
import { BarView } from "./views/bar";
import DefaultView from "./views/default";

it("Should render in target element", async () => {
    clearRenders();
    navigateTo("/foo");

    await new Promise(r => setTimeout(r, 100));

    const router = getBasicRouterSetup();
    router.start();

    const outlet = document.querySelector("#outlet");
    const needle = outlet?.querySelector("#needle");

    expect(needle).to.not.equal(null);
});

it("Should render in default outlet", async () => {
    clearRenders();
    navigateTo("/outlet");

    await new Promise(r => setTimeout(r, 100));

    const router = getOutletSetup();
    router.start();

    const outlet = document.querySelector("suunta-view");
    const subOutlet = outlet?.querySelector("suunta-view");

    expect(subOutlet).to.not.equal(null);
});


it("Should render in child outlet", async () => {
    clearRenders();
    navigateTo("/outlet/child");

    await new Promise(r => setTimeout(r, 100));

    const router = getOutletSetup();
    router.start();

    await new Promise(r => setTimeout(r, 100));

    const outlet = document.querySelector("suunta-view");
    const subOutlet = outlet?.querySelector("suunta-view");
    const needle = subOutlet?.querySelector("#needle");

    expect(subOutlet).to.not.equal(null);
    expect(needle).to.not.equal(null);
});