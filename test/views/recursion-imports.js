export const Foo = () => {
    /**
     * @type { import("lit-html").TemplateResult }
     */
    const imp = import("./recursion-imports.js");
    return imp;
}