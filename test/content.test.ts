import { expect } from "@esm-bundle/chai";
import { DEFAULT_OUTLET, clearRenders, getBasicRouterSetup, navigateTo } from "./util";
import { fixture, html } from "@open-wc/testing";
import { render } from "lit-html";
import { ViewRoute } from "../lib/core/route";

it("Should render the contents of the foo route to DOM", async () => {
    clearRenders();
    navigateTo("/foo");

    await new Promise(r => setTimeout(r, 100));

    const router = getBasicRouterSetup();
    router.start();
    const currentView = router.getCurrentView();

    const target = await fixture(DEFAULT_OUTLET);
    const route = currentView?.route as ViewRoute;
    render(route.view, target as HTMLElement);

    expect(target).dom.to.equal(document.querySelector("#outlet")?.outerHTML);
});

it("Should render the contents of a dynamic route to the DOM", async () => {
    clearRenders();
    navigateTo("/user/123");

    await new Promise(r => setTimeout(r, 100));

    const router = getBasicRouterSetup();
    router.start();

    await new Promise(r => setTimeout(r, 100));

    const target = await fixture(html`<p>User page for id 123</p>`);

    expect(target).dom.to.equal(document.querySelector("#outlet")?.innerHTML);
});
