import { Route } from "./route";
import { SuuntaView } from "./view";

export interface SuuntaInitOptions {
    routes: Route[];
    base?: string;
}


export class Suunta {

    #currentView: SuuntaView | undefined;
    #routes: Map<string, Route> = new Map();
    public started = false;

    constructor(private options: SuuntaInitOptions) {
        this.options.routes.forEach(route => {
            this.#routes.set(route.path, route);
        });
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

        return this.#routes.get(path);
    }

    public navigate(route: Route) {
        this.#currentView = {
            href: window.location.href,
            route,
            properties: { ...route.properties }
        }
    }

    public getCurrentView() {
        return this.#currentView;
    }
}
