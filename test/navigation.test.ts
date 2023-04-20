import { expect } from "@esm-bundle/chai";
import { clearRenders, getBasicRouterSetup, navigateTo } from "./util";
import { onNavigation } from "../lib/triggers";

it("Should render /foo view when window.location.href is set to /foo", async () => {
    clearRenders();
    navigateTo("/foo");

    await new Promise(r => setTimeout(r, 100));

    const router = getBasicRouterSetup();
    router.start();

    const currentView = router.getCurrentView();
    expect(currentView?.route.path).to.equal("/foo");
    expect(currentView?.route.name).to.equal("Foo");
});

it("Should redirect correctly", () => {
    clearRenders();
    navigateTo("/redirect");

    const router = getBasicRouterSetup();
    router.start();
    const currentView = router.getCurrentView();

    expect(currentView?.route.path).to.equal("/foo");
    expect(currentView?.route.name).to.equal("Foo");
});

it("Should render dynamic pages with params", () => {
    clearRenders();
    navigateTo("/user/123");

    const router = getBasicRouterSetup();
    router.start();
    const currentView = router.getCurrentView();

    expect(currentView?.route.path).to.equal("/user/{id}(\\d+)")
    expect(currentView?.route.name).to.equal("User profile")
    expect(currentView?.route.properties?.id).to.equal("123")
    expect(Object.keys(currentView?.route.properties!).length).to.equal(1);
});

it("Should not render dynamic pages with params not fully matching the matcher regex", () => {
    clearRenders();
    navigateTo("/user/12bcd");

    const router = getBasicRouterSetup();
    router.start();

    const currentView = router.getCurrentView();

    expect(currentView?.route.path).to.equal("/{notFoundPath}(.*)");
});

it("Should match the 404 route when route was not found", () => {
    clearRenders();
    navigateTo("/bar");

    const router = getBasicRouterSetup();
    router.start();

    const currentView = router.getCurrentView();
    expect(currentView?.route.path).to.equal("/{notFoundPath}(.*)");
});


it("Should not navigate when navigating to same page", async () => {
    clearRenders();
    navigateTo("/page");

    const router = getBasicRouterSetup();
    await router.start();


    let onNavigationTriggered = false;
    onNavigation(() => {
        onNavigationTriggered = true;
    })


    router.navigateTo({ name: "Page" });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const currentView = router.getCurrentView();
    expect(currentView?.route.path).to.equal("/page");
    expect(onNavigationTriggered).to.be.false;
});
