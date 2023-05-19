import { render, html } from "lit-html";

/**
  * @property { unknown } viewToRender
  * @property { ViewRoute } route
  * @property { SuuntaTarget } renderTarget
  * */
export function litRenderer(viewToRender, route, renderTarget) {
    render(html`${viewToRender}`, renderTarget);
}
