import { html, render } from "lit-html";
import { isRedirectRoute, isViewRoute, Route, RouteQueryObject } from "./route";
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

    private discoverTarget(): void {
        let soonToBeTarget: SuuntaTarget | string = this.options.target;
        if (typeof soonToBeTarget === "string") {
            let foundElement = document.querySelector<HTMLElement>(soonToBeTarget);
            if (foundElement) {
                this.#target = foundElement;
            }
        }
    }

    public start(): void {
        this.started = true;
        const currentRoute = this.getRouteFromCurrentURL();
        if (!currentRoute) {
            // TODO: Change this path to a 404 page nav etc.
            throw new Error("Could not find a route to navigate to.");
        }
        this.navigate(currentRoute);
    }

    public getRoute(routeQueryObject: RouteQueryObject): Route | undefined {
        if (routeQueryObject.name) {
            return [...this.routes.values()].find(route => route.name === routeQueryObject.name);
        }
        if (routeQueryObject.path) {
            // TODO: Make this just try to get from map? How about dynamic routes?
            return [...this.routes.values()].find(route => route.path === routeQueryObject.path);
        }
    }

    private getRouteFromCurrentURL(): Route | undefined {
        const currentURL = new URL(window.location.href);
        const path = currentURL.pathname;

        return this.routes.get(path);
    }

    public navigate(route: Route): void {
        this.#currentView = {
            href: window.location.href,
            route,
            properties: { ...route.properties }
        };

        if (isViewRoute(route)) {
            render(html`${route.view}`, this.#target);
        }
        if (isRedirectRoute(route)) {
            const redirectTarget = this.getRoute({ name: route.redirect });
            if (!redirectTarget) {
                throw new Error("Could not redirect to route '" + route.redirect + "' as it could not be found.");
            }
            this.navigate(redirectTarget);
        }

    }

    public getCurrentView(): SuuntaView | undefined {
        return this.#currentView;
    }
}
