import { Suunta } from "../lib/suunta";
import { expect } from '@esm-bundle/chai';

it("Should return a router instance", () => {
    const router = new Suunta();

    expect(router).to.not.equal(null);
});
