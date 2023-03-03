import { html, render } from "lit-html";
import { Route } from "./route";
import { SuuntaView } from "./view";

type SuuntaTarget = HTMLElement | DocumentFragment;

export interface SuuntaInitOptions {
    routes: Route[];
    target: string | HTMLElement | DocumentFragment;
    base?: string;
}


export class Suunta {

    #currentView: SuuntaView | undefined;
    #target: SuuntaTarget = document.createDocumentFragment();
    public routes: Map<string, Route> = new Map();
    public started = false;

    constructor(private options: SuuntaInitOptions) {
        this.options.routes.forEach(route => {
            this.routes.set(route.path, route);
        });
        this.discoverTarget();
    }

    private discoverTarget() {
        let soonToBeTarget: SuuntaTarget | string = this.options.target;
        if (typeof soonToBeTarget === "string") {
            let foundElement = document.querySelector<HTMLElement>(soonToBeTarget);
            if (foundElement) {
                this.#target = foundElement;
            }
        }
    }

    public start() {
        this.started = true;
        const currentRoute = this.getRouteFromCurrentURL();
        if (!currentRoute) {
            // TODO: Change this path to a 404 page nav etc.
            throw new Error("Could not find a route to navigate to.");
        }
        this.navigate(currentRoute);
    }

    private getRouteFromCurrentURL(): Route | undefined {
        const currentURL = new URL(window.location.href);
        const path = currentURL.pathname;

        return this.routes.get(path);
    }

    public navigate(route: Route) {
        this.#currentView = {
            href: window.location.href,
            route,
            properties: { ...route.properties }
        };

        render(html`${route.view}`, this.#target);
    }

    public getCurrentView() {
        return this.#currentView;
    }
}
