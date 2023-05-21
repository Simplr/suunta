import { expect } from "@esm-bundle/chai";
import { combinePaths } from "suunta-core/route";

it("Should manage combining different types of paths", async () => {
    const paths = [
        { first: "/foo", second: "/bar" },
        { first: "/foo/", second: "bar" },
        { first: "/foo/", second: "/bar" },
        { first: "/foo", second: "/bar" },
        { first: "/foo", second: "bar" },
    ];

    const resolvedPaths = paths.map((pair) => combinePaths(pair.first, pair.second));

    resolvedPaths.forEach(resPath => {
        expect(resPath).to.equal("/foo/bar");
    })
});
