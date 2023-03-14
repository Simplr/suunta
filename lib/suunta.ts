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
    public routeMatchers: Map<RegExp, Route> = new Map();
    public started = false;

    constructor(private options: SuuntaInitOptions) {
        this.options.routes.forEach(route => {
            this.routes.set(route.path, route);
            const routeMatcher = this.createRouteMatcher(route.path);
            if (routeMatcher) {
                this.routeMatchers.set(routeMatcher, route);
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

        const pathSplit = path.split("/").filter(part => part.length > 0);
        let regexString = "";
        for (const pathPart of pathSplit) {
            if (!wildcards.includes(pathPart)) {
                regexString += "\\/" + pathPart;
                continue;
            }
            const matcherKey = pathPart.substring(pathPart.indexOf("{") + 1, pathPart.indexOf("}"));
            let matcher = pathPart.match(/\(.*\)/)?.[0];
            if (!matcher) {
                matcher = "(.*)";
            }
            const matcherWithoutWrappingParenthesis = matcher.replace(/^\(/, "").replace(/\)$/, "");
            const matcherKeyRegex = `(?<${matcherKey}>${matcherWithoutWrappingParenthesis})`;
            regexString += "\\/" + matcherKeyRegex;
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
            throw new Error(`Could not find a route to navigate to, and no fallback route was set. 
                            To set a fallback route, add one with the matcher '/{notFoundPath}(.*)', or just '/{notFoundPath}'.`);
        }
        this.navigate(currentRoute);
    }

    public getRoute(routeQueryObject: RouteQueryObject): Route | undefined {
        if (routeQueryObject.name) {
            return [...this.routes.values()].find(route => route.name === routeQueryObject.name);
        }
        if (!routeQueryObject.path) {
            throw new Error("RouteQueryObject must contain either a name or a path");
        }

        const path = routeQueryObject.path;

        const matchedStaticPath = [...this.routes.values()].find(route => route.path === path);
        if (matchedStaticPath) {
            return matchedStaticPath;
        }

        // We didn't match a name, nor a static path. Try to resolve via regex.
        for (const matcherEntry of this.routeMatchers.entries()) {
            const matcher = matcherEntry[0];
            const match = path.match(matcher);
            if (!match) {
                continue;
            }
            const rawMatch = match[0];
            if (path !== rawMatch) {
                continue;
            }

            console.log(match.groups);
            const matchedRoute = matcherEntry[1];
            return {
                ...matchedRoute,
                properties: match.groups ?? {}
            }
        }
    }

    private getRouteFromCurrentURL(): Route | undefined {
        const currentURL = new URL(window.location.href);
        const path = currentURL.pathname;

        return this.getRoute({ path })
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
