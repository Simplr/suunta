import { expect } from "@esm-bundle/chai";
import { clearRenders, getBasicRouterSetup, navigateTo } from "./util";

it("Should render /foo view when window.location.href is set to /foo", async () => {
    navigateTo("/foo");

    await new Promise(r => setTimeout(r, 100));
    clearRenders();

    const router = getBasicRouterSetup();
    router.start();

    const currentView = router.getCurrentView();
    expect(currentView?.route.path).to.equal("/foo");
    expect(currentView?.route.name).to.equal("Foo");
});

it("Should redirect correctly", () => {
    navigateTo("/redirect");
    clearRenders();

    const router = getBasicRouterSetup();
    router.start();
    const currentView = router.getCurrentView();

    expect(currentView?.route.path).to.equal("/foo");
    expect(currentView?.route.name).to.equal("Foo");
});

it("Should render dynamic pages with params", () => {
    navigateTo("/user/123");
    clearRenders();

    const router = getBasicRouterSetup();
    router.start();
    const currentView = router.getCurrentView();

    expect(currentView?.route.path).to.equal("/user/{id}(\\d+)")
    expect(currentView?.route.name).to.equal("User profile")
    expect(currentView?.route.properties?.id).to.equal("123")
    expect(Object.keys(currentView?.route.properties!).length).to.equal(1);
});

it("Should not render dynamic pages with params not mathing the matcher regex", () => {
    navigateTo("/user/12bcd");
    clearRenders();

    const router = getBasicRouterSetup();
    router.start();

    console.log()
});

it("Should match the 404 route when route was not found", () => {
    navigateTo("/bar");
    clearRenders();

    const router = getBasicRouterSetup();
    router.start();

    const currentView = router.getCurrentView();
    console.log(currentView);
});

