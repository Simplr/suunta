
import { expect } from "@esm-bundle/chai";
import { DEFAULT_OUTLET, clearRenders, getBasicRouterSetup, navigateTo } from "./util";
import { fixture, html } from "@open-wc/testing";
import { render } from "lit-html";
import { ViewRoute } from "../lib/route";
import { onNavigation } from "../lib/triggers";

it("should trigger onNavigation", async () => {
    clearRenders();
    navigateTo("/foo");

    await new Promise(r => setTimeout(r, 100));

    let triggered = false;
    onNavigation(() => {
        triggered = true;
    });

    const router = getBasicRouterSetup();
    router.start();

    expect(triggered).to.be.true;
});