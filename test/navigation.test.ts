import { expect } from "@esm-bundle/chai";
import { clearRenders, getBasicRouterSetup } from "./util";

it("Should render /foo view when window.location.her is set to /foo", () => {
    window.location.href = "/foo";
    clearRenders();

    const router = getBasicRouterSetup();
    router.start();

    const currentView = router.getCurrentView();
    console.log(currentView)

});
