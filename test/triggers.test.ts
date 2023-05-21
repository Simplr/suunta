import { expect } from "@esm-bundle/chai";
import { clearRenders, getBasicRouterSetup, navigateTo } from "./util";
import { onNavigation } from "suunta-core";

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
