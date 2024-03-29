import { createRouteMatcher } from "./matcher";
import { ChildViewRoute, combinePaths, ImportedView, ImportResult, isChildRoute, isRedirectRoute, isViewRoute, Lazy, LazyImportedRouteView, RedirectRoute, RenderableView, Route, RouteQueryObject, RouteView, ViewRoute } from "./route";
import { NAVIGATED_EVENT } from "./triggers";
import { SuuntaView } from "./view";

type SuuntaTarget = HTMLElement | DocumentFragment;
type RouteTransformer = (route: Route) => Route | Promise<Route>;

export interface SuuntaInitOptions {
    routes: Route[];
    renderer?: (viewToRender: unknown, route: ViewRoute, renderTarget: SuuntaTarget) => void;
    beforeNavigate?: RouteTransformer;
    target?: string | SuuntaTarget;
    base?: string;
}

export class Suunta {

    #currentRoute: Route | undefined;
    #currentView: SuuntaView | undefined;
    #currentRenderTarget: SuuntaTarget | undefined;
    public routes: Map<string, Route> = new Map();
    public routeMatchers: Map<RegExp, Route> = new Map();
    public started = false;
    public beforeNavigate?: RouteTransformer;

    constructor(public options: SuuntaInitOptions) {
        if (!this.options.renderer) {
            throw new Error("[Suunta]: No renderer set! Set a router in the Suunta initialization options or use the `suunta` -package with the default Lit renderer.\n\nimport { Suunta } from 'suunta';")
        }
        this.beforeNavigate = options.beforeNavigate;
        this.mapRoutes();
    }

    private mapRoutes(): void {
        this.options.routes.forEach((route) => this.mapRoute(route));
    }

    private mapRoute(route: Route): void {
        this.routes.set(route.path, route);
        const routeMatcher = createRouteMatcher(route.path);
        if (routeMatcher) {
            this.routeMatchers.set(routeMatcher, route);
        }
        if (isViewRoute(route)) {
            route.children?.forEach(childRoute => {
                const relativeChildRoute: ChildViewRoute = {
                    ...childRoute,
                    path: combinePaths(route.path, childRoute.path),
                    isChild: true,
                    parent: route
                };
                this.mapRoute(relativeChildRoute);
            });
        }
    }

    public async start(): Promise<void> {
        const currentRoute = this.getRouteFromCurrentURL();
        this.setupListeners();
        await this.navigate(currentRoute, false);
        this.started = true;
    }

    private setupListeners() {
        document.body.addEventListener("click", (clickEvent) => {
            const path = clickEvent.composedPath();
            const closestLink = path.filter(el => (el as HTMLAnchorElement).href !== undefined && (el as HTMLAnchorElement).href).pop();
            if (!closestLink) {
                return;
            }
            clickEvent.preventDefault();
            const navigationTargetUrl = (closestLink as Element)?.getAttribute("href") ?? undefined;
            const route = this.getRoute({ path: navigationTargetUrl })
            this.navigate(route);
        });
        window.addEventListener("popstate", () => {
            const currentRoute = this.getRouteFromCurrentURL();
            this.navigate(currentRoute, false);
        });
    }

    private getTarget(parentRenderTarget?: SuuntaTarget): SuuntaTarget {
        const parent = parentRenderTarget ?? document;

        let soonToBeTarget: typeof this.options.target = this.options.target;
        if (soonToBeTarget === undefined) {
            const outlet = parent.querySelector<HTMLElement>("suunta-view");
            if (!outlet) {
                throw new Error(`[Suunta]: No router target nor a outlet tag was set. Create a <suunta-view> element or specify a css selector for target div with\n\n${JSON.stringify({ routes: [], target: "#my-div" }, null, 4)}\n`)
            }
            return outlet;
        }
        if (typeof soonToBeTarget !== "string") {
            return soonToBeTarget;
        }
        let foundElement = parent.querySelector<HTMLElement>(soonToBeTarget);
        if (foundElement) {
            return foundElement;
        }
        throw new Error("[Suunta]: Can't find a router target");
    }

    public async navigateTo(routeQueryObject: RouteQueryObject): Promise<void> {
        const route = this.getRoute(routeQueryObject);
        await this.navigate(route);
    }

    public getRoute(routeQueryObject: RouteQueryObject): Route | undefined {
        if (routeQueryObject.name) {
            return [...this.routes.values()].find(route => route.name === routeQueryObject.name);
        }
        if (!routeQueryObject.path) {
            throw new Error("[Suunta]: RouteQueryObject must contain either a name or a path");
        }

        let path = routeQueryObject.path;
        let queryParameters = undefined;
        let hash = "";
        try {
            const urlObject = new URL(path, window.location.origin);
            path = urlObject.pathname;
            queryParameters = urlObject.searchParams;
            hash = urlObject.hash;
        } catch (_ignored) {
            console.warn("[Suunta]: Failed to parse URL object out of route.");
        }

        const matchedStaticPath = [...this.routes.values()].find(route => route.path === path);
        if (matchedStaticPath) {
            return {
                ...matchedStaticPath,
                queryParameters,
                hash
            };
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

            const matchedRoute = { ...matcherEntry[1] };
            matchedRoute.path = path;
            return {
                ...matchedRoute,
                properties: match.groups,
                queryParameters,
                hash
            };
        }

        return undefined;
    }

    private getRouteFromCurrentURL(): Route | undefined {
        const currentURL = new URL(window.location.href);
        let path = currentURL.href.replace(currentURL.origin, "");
        if (this.options.base) {
            path = path.replace(this.options.base, "");
        }

        return this.getRoute({ path })
    }

    private async navigate(route: Route | undefined, pushState = true, isReRender = false): Promise<void> {
        if (!route) {
            // TODO: Change this path to a 404 page nav etc.
            throw new Error(`[Suunta]: Could not find a route to navigate to, and no fallback route was set. 
                            To set a fallback route, add one with the matcher '/{notFoundPath}(.*)', or just '/{notFoundPath}'.`);
        }

        if (route === this.#currentView?.route && !isReRender) {
            return; // same route
        }

        if (this.beforeNavigate) {
            route = await this.beforeNavigate(route);
        }

        this.#currentRoute = route;

        this.#currentView = {
            href: window.location.href,
            route,
            properties: { ...route.properties }
        };

        if (pushState) {
            this.pushHistoryState(route);
        }

        if (isViewRoute(route)) {
            await this.handleViewRoute(route);
            return;
        }

        if (isRedirectRoute(route)) {
            await this.handleRedirectRoute(route);
            return;
        }
    }

    public async reNavigate() {
        return this.navigate(this.getCurrentRoute(), false, true);
    }

    pushHistoryState(route: Route) {
        let pathToWrite = route.path;
        if (this.options.base) {
            pathToWrite = this.options.base + route.path;
        }
        try {
            const urlObject = new URL(pathToWrite, window.location.origin);
            urlObject.hash = route.hash ?? '';
            if (route.queryParameters) {
                [...route.queryParameters].forEach(qp => urlObject.searchParams.set(qp[0], qp[1]));
            }
            pathToWrite = urlObject.href.replace(urlObject.origin, "");
        } catch (_ignored) { }
        window.history.pushState(null, "", pathToWrite);
    }

    async handleViewRoute(route: ViewRoute | ChildViewRoute) {
        let parentRenderTarget: SuuntaTarget | undefined = undefined;
        if (isChildRoute(route)) {
            await this.handleViewRoute(route.parent);
            parentRenderTarget = this.#currentRenderTarget;
        }

        let renderableView: RouteView | ImportedView = route.view;

        let iterationCount = 0;
        while (renderableView !== null) {
            if (isRenderableView(renderableView)) {
                this.render(renderableView, route, parentRenderTarget);
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
                throw new Error("[Suunta]: Could not parse route from View. Recursion level too deep.")
            }
        }
        await waitFrame(2);
        document.dispatchEvent(new CustomEvent(NAVIGATED_EVENT, { detail: { route } }));
    }

    async handleRedirectRoute(route: RedirectRoute) {
        const redirectTarget = this.getRoute({ name: route.redirect });
        if (!redirectTarget) {
            throw new Error("[Suunta]: Could not redirect to route '" + route.redirect + "' as it could not be found.");
        }
        this.navigate(redirectTarget);
    }

    render(viewToRender: unknown, route: ViewRoute, parentRenderTarget?: SuuntaTarget) {
        const target = this.getTarget(parentRenderTarget);
        this.#currentRenderTarget = target;
        this.options.renderer!(viewToRender, route, target);
    }

    public getCurrentView(): SuuntaView | undefined {
        return this.#currentView;
    }

    public getCurrentRoute(): Route | undefined {
        return this.#currentRoute;
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
function waitFrame(count = 1): Promise<void> {
    return new Promise(async (resolve) => {
        for (let i = 0; i < count; i++) {
            await new Promise(r => window.requestAnimationFrame(r));
        }
        resolve();
    });
}
