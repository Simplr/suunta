import { expect } from "@esm-bundle/chai";
import { clearRenders, getBasicRouterSetup } from "./util";

it("Should render /foo view when window.location.href is set to /foo", () => {
    window.location.href = "/foo";
    clearRenders();

    const router = getBasicRouterSetup();
    router.start();

    const currentView = router.getCurrentView();
    console.log(currentView)
});

it("Should render dynamic pages with params", () => {
    window.location.href = "/user/123";
    clearRenders();

    const router = getBasicRouterSetup();
    router.start();
});

it("Should not render dynamic pages with params not mathing the matcher regex", () => {
    window.location.href = "/user/12bcd";
    clearRenders();

    const router = getBasicRouterSetup();
    router.start();
});

it("Should match the 404 route when route was not found", () => {
    window.location.href = "/user/12bcd";
    clearRenders();

    const router = getBasicRouterSetup();
    router.start();
});

it("Should redirect correctly", () => {
    window.location.href = "/user/12bcd";
    clearRenders();

    const router = getBasicRouterSetup();
    router.start();
});
