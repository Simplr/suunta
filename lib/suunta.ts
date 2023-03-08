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
    public routeMatchers: Map<string, RegExp> = new Map();
    public started = false;

    constructor(private options: SuuntaInitOptions) {
        this.options.routes.forEach(route => {
            this.routes.set(route.path, route);
            console.log(route.path);
            const routeMatcher = this.createRouteMatcher(route.path);
            if (routeMatcher) {
                this.routeMatchers.set(route.path, routeMatcher);
            }
        });
        this.discoverTarget();
    }

    createRouteMatcher(path: string): RegExp | undefined {
        const wildcards = path.match(/{.*}(?:\(.*\))*/);
        if (wildcards == null) {
            // No need to generate for non-wildcard routes
            return undefined;
        }
        console.log(wildcards);
        console.log(path.split("/"))

        const pathSplit = path.split("/").filter(part => part.length > 0);
        let regexString = "";
        for (const pathPart of pathSplit) {
            console.log(pathPart)
            if (!wildcards.includes(pathPart)) {
                regexString += "\\/" + pathPart;
                continue;
            }
            const matcherKey = pathPart.substring(pathPart.indexOf("{") + 1, pathPart.indexOf("}"));
            let matcher = pathPart.match(/\(.*\)/)?.[0];
            if (!matcher) {
                matcher = "(.*)";
            }
            regexString += "\\/" + pathPart.replace(/{.*}/, `(?<${matcherKey}>)`);
        }

        return new RegExp(regexString);
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
        // TODO: This path should also handle all basic navigations done by the user by clicking a link
        // and / or basic stuff.
        // So this will be the catch all for all navigation route parsing from now on
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
