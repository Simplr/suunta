import { html, render } from "lit-html";
import { createRouteMatcher } from "./matcher";
import { ImportedView, ImportResult, isRedirectRoute, isViewRoute, Lazy, LazyImportedRouteView, RenderableView, Route, RouteQueryObject, RouteView, ViewRoute } from "./route";
import { NAVIGATED_EVENT } from "./triggers";
import { SuuntaView } from "./view";

type SuuntaTarget = HTMLElement | DocumentFragment;

export interface SuuntaInitOptions {
    routes: Route[];
    target?: string | SuuntaTarget;
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
            const routeMatcher = createRouteMatcher(route.path);
            if (routeMatcher) {
                this.routeMatchers.set(routeMatcher, route);
            }
        });
    }

    public start(): void {
        const currentRoute = this.getRouteFromCurrentURL();
        this.navigate(currentRoute);
        this.setupListeners();
        this.started = true;
    }

    private setupListeners() {
        document.body.addEventListener("click", (clickEvent) => {
            clickEvent.preventDefault();
            const path = clickEvent.composedPath();
            const closestLink = path.filter(el => (el as HTMLAnchorElement).href !== undefined).pop();
            if (!closestLink) {
                return;
            }

            const navigationTargetUrl = (closestLink as Element)?.getAttribute("href") ?? undefined;
            const route = this.getRoute({ path: navigationTargetUrl })
            this.navigate(route);
        });
    }

    private getTarget(): SuuntaTarget {
        let soonToBeTarget: typeof this.options.target = this.options.target;
        if (soonToBeTarget === undefined) {
            const outlet = document.querySelector<HTMLElement>("suunta-view");
            if (!outlet) {
                throw new Error("[Suunta]: No router target nor a outlet tag was set.")
            }
            return outlet;
        }
        if (typeof soonToBeTarget !== "string") {
            return soonToBeTarget;
        }
        let foundElement = document.querySelector<HTMLElement>(soonToBeTarget);
        if (foundElement) {
            return foundElement;
        }
        throw new Error("[Suunta]: Can't find a router target");
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

    public async navigate(route: Route | undefined): Promise<void> {
        if (!route) {
            // TODO: Change this path to a 404 page nav etc.
            throw new Error(`[Suunta]: Could not find a route to navigate to, and no fallback route was set. 
                            To set a fallback route, add one with the matcher '/{notFoundPath}(.*)', or just '/{notFoundPath}'.`);
        }

        if (route === this.#currentView?.route) {
            return; // same route
        }

        this.#currentView = {
            href: window.location.href,
            route,
            properties: { ...route.properties }
        };

        window.history.pushState(null, "", route.path);

        if (isViewRoute(route)) {
            let renderableView: RouteView | ImportedView = route.view;

            let iterationCount = 0;
            while (renderableView !== null) {
                if (isRenderableView(renderableView)) {
                    this.render(html`${renderableView}`);
                    break;
                }

                if (isFunction(renderableView)) {
                    renderableView = await renderableView();
                }

                if (isModule(renderableView)) {
                    const exportedView: ImportResult = renderableView.default ?? Object.values(renderableView)[0];
                    if (exportedView) {
                        renderableView = exportedView;
                    } else {
                        throw new Error("[Suunta]: Could not parse imported route.")
                    }
                }
                iterationCount++;
                if (iterationCount > 10) {
                    throw new Error("[Suunta]: Could not parse route from View.")
                }
            }
        }

        if (isRedirectRoute(route)) {
            const redirectTarget = this.getRoute({ name: route.redirect });
            if (!redirectTarget) {
                throw new Error("Could not redirect to route '" + route.redirect + "' as it could not be found.");
            }
            this.navigate(redirectTarget);
        }
    }

    render(viewToRender: unknown) {
        const target = this.getTarget();
        render(viewToRender, target); 
        document.dispatchEvent(new CustomEvent(NAVIGATED_EVENT));
    }

    public getCurrentView(): SuuntaView | undefined {
        return this.#currentView;
    }
}

// Ugly type hack until I come up with something better to type it
function isModule(something: unknown): something is ImportedView {
    return Object.prototype.toString.call(something) === "[object Module]";
}

function isRenderableView(view: RouteView | ImportedView): view is RenderableView {
    return typeof view !== "function" && !isModule(view);
}

function isFunction(view: RouteView | ImportedView): view is Lazy<RenderableView> | LazyImportedRouteView {
    return typeof view === "function";
}
