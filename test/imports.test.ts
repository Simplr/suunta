import { expect } from "@esm-bundle/chai";
import { clearRenders, getDynamicImportRouterSetup, navigateTo } from "./util";
import { fixture, html } from "@open-wc/testing";
import { render } from "lit-html";
import { ViewRoute } from "../lib/route";
import { FooView } from "./views/foo";

it("Should support dynamic imports", async () => {
    clearRenders();
    navigateTo("/foo");

    await new Promise(r => setTimeout(r, 100));

    const router = getDynamicImportRouterSetup();
    router.start();

    await new Promise(r => setTimeout(r, 100));

    const target = await fixture(html`<div id="outlet"></div>`);
    render(FooView(), target as HTMLElement);

    expect(target).dom.to.equal(document.querySelector("#outlet")?.outerHTML);
});