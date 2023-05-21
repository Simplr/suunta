import { html } from "lit"
import { onNavigation } from "suunta"

export const View = () => {

    onNavigation(() => {
        console.log("Loading view");
    });


    return html`
        <p>Foo View</p>
    `
}
