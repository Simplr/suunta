import { expect } from "@esm-bundle/chai";
import { DEFAULT_OUTLET, clearRenders, getBasicRouterSetup, getDynamicImportRouterSetup, navigateTo } from "./util";
import { fixture, html } from "@open-wc/testing";
import { render } from "lit-html";
import { Suunta, SuuntaInitOptions } from "../lib/suunta";

it("Should throw on ......", async () => {
    clearRenders();
    navigateTo("/foo");
    await new Promise(r => setTimeout(r, 100));

    const routerOptions: SuuntaInitOptions = {
        routes: [],
        target: "body"
    };

    const router = new Suunta(routerOptions);

    //expect(router.start()).to.be.rejectedWith("");
});