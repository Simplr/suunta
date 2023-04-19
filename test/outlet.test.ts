import { expect } from "@esm-bundle/chai";
import { clearRenders, getBasicRouterSetup, getOutletSetup, navigateTo } from "./util";

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

it("Should render in grandchildchild outlet", async () => {
    clearRenders();
    navigateTo("/outlet/child-with-grandchild/grandchild");

    await new Promise(r => setTimeout(r, 100));

    const router = getOutletSetup();
    router.start();

    await new Promise(r => setTimeout(r, 100));

    const outlet = document.querySelector("suunta-view");
    const subOutlet = outlet?.querySelector("suunta-view");
    const subSubOutlet = subOutlet?.querySelector("suunta-view");
    const needle = subSubOutlet?.querySelector("#needle");

    expect(subOutlet).to.not.equal(null);
    expect(subSubOutlet).to.not.equal(null);
    expect(needle).to.not.equal(null);
});