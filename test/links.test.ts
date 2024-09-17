import { expect } from "@open-wc/testing";
import { clearRenders, getBasicRouterSetup, navigateTo } from "./util";

it("Should navigate via router on a link click", async () => {
    clearRenders();
    navigateTo("/anchor");

    const router = getBasicRouterSetup();
    router.start();

    await new Promise(r => setTimeout(r, 100));

    const currentViewBefore = router.getCurrentView();

    expect(currentViewBefore?.route.path).to.equal("/anchor");

    const anchor = document.querySelector("a");
    anchor?.click();

    await new Promise(r => setTimeout(r, 100));

    const currentView = router.getCurrentView();
    expect(currentView?.route.path).to.equal("/user");
});
