import { createRouteMatcher } from './matcher.js';
import {
    combinePaths,
    isChildRoute,
    isFunction,
    isModule,
    isRedirectRoute,
    isRenderableView,
    isViewRoute,
    waitFrame,
} from './route-helpers.js';
import { initializeRouterForStateOperations } from './state.js';
import { NAVIGATED_EVENT, UPDATED_EVENT } from './triggers.js';

export class Suunta {
    /** @type { import("./route").Route | undefined } */
    #currentRoute;
    /** @type { import("./view").SuuntaView | undefined } */
    #currentView;
    /** @type { import("./route").SuuntaTarget | undefined } */
    #currentRenderTarget;
    /** @type { Map<string, import("./route").Route> } */
    routes = new Map();
    /** @type { Map<RegExp, import("./route").Route> } */
    routeMatchers = new Map();
    /** @type { boolean } */
    started = false;
    /** @type { import("./route").RouteTransformer<import("./route.js").Route> | undefined } */
    beforeNavigate;

    /** @type { import('./route.js').RenderStackEntry[] } */
    #currentNavigationRenderStack = [];

    /**
     * @param {import("./route").SuuntaInitOptions<import("./route.js").Route>} options
     */
    constructor(options) {
        this.options = options;
        if (!this.options.renderer) {
            throw new Error(
                "[Suunta]: No renderer set! Set a router in the Suunta initialization options or use the `suunta` -package with the default Lit renderer.\n\nimport { Suunta } from 'suunta';",
            );
        }
        this.beforeNavigate = options.beforeNavigate;
        this.#mapRoutes();
        initializeRouterForStateOperations(this);
    }

    #mapRoutes() {
        this.options.routes.forEach(route => this.#mapRoute(route));
    }

    /**
     * @param { import("./route").Route } route
     */
    #mapRoute(route) {
        this.routes.set(route.path, route);
        const routeMatcher = createRouteMatcher(route.path);
        if (routeMatcher) {
            this.routeMatchers.set(routeMatcher, route);
        }
        if (isViewRoute(route)) {
            route.children?.forEach(childRoute => {
                const relativeChildRoute = /** @type { import("./route").Route } */ ({
                    ...childRoute,
                    path: combinePaths(route.path, childRoute.path),
                    isChild: true,
                    parent: route,
                });
                this.#mapRoute(relativeChildRoute);
            });
        }
    }

    /**
     * @returns { Promise<void> }
     */
    async start() {
        const currentRoute = this.#getRouteFromCurrentURL();
        this.#setupListeners();
        await this.#navigate(currentRoute, { pushState: false });
        this.started = true;
    }

    #setupListeners() {
        document.body.addEventListener('click', clickEvent => {
            const path = clickEvent.composedPath();
            const closestLink = path
                .filter(
                    el =>
                        /** @type { HTMLAnchorElement } */ (el).href !== undefined &&
                        /** @type { HTMLAnchorElement } */ (el).href !== '',
                )
                .pop();
            if (!closestLink) {
                return;
            }
            const navigationTargetUrl = /** @type { Element } */ (closestLink)?.getAttribute('href') ?? undefined;
            const route = this.getRoute({ path: navigationTargetUrl });
            this.#navigate(route, { originalEvent: clickEvent });
        });
        window.addEventListener('popstate', () => {
            const currentRoute = this.#getRouteFromCurrentURL();
            this.#navigate(currentRoute, { pushState: false });
        });
    }

    /**
     * @param { import("./route").SuuntaTarget } [parentRenderTarget]
     * @param { boolean } [routeIsChildRoute]
     * @returns { import("./route").SuuntaTarget }
     */
    getTarget(parentRenderTarget, routeIsChildRoute) {
        const parent = parentRenderTarget ?? document;

        /** @type { typeof this.options.target } */
        const soonToBeTarget = this.options.target;
        if (soonToBeTarget === undefined || routeIsChildRoute) {
            /** @type { HTMLElement | null } */
            const outlet = parent.querySelector('suunta-view');
            if (!outlet) {
                throw new Error(
                    `[Suunta]: No router target nor a outlet tag was set. Create a <suunta-view> element or specify a css selector for target div with\n\n${JSON.stringify(
                        { routes: [], target: '#my-div' },
                        null,
                        4,
                    )}\n`,
                );
            }
            return outlet;
        }
        if (typeof soonToBeTarget !== 'string') {
            return soonToBeTarget;
        }
        /** @type { HTMLElement | null } */
        const foundElement = parent.querySelector(soonToBeTarget);
        if (foundElement) {
            return foundElement;
        }
        throw new Error("[Suunta]: Can't find a router target");
    }

    /**
     * @param { { name: string } | { path: string } } routeQueryObject
     * @returns { Promise<void> }
     */
    async navigateTo(routeQueryObject) {
        const route = this.getRoute(routeQueryObject);
        await this.#navigate(route);
    }

    /**
     * @param { import("./route").RouteQueryObject } routeQueryObject
     * @returns { import("./route").Route | undefined }
     */
    getRoute(routeQueryObject) {
        if (routeQueryObject.name) {
            return [...this.routes.values()].find(route => route.name === routeQueryObject.name);
        }
        if (!routeQueryObject.path === undefined) {
            throw new Error('[Suunta]: RouteQueryObject must contain either a name or a path');
        }
        if (routeQueryObject.path === '') {
            // TODO: Is this ok? Do we need extra checks here
            routeQueryObject.path = '/';
        }

        let path = routeQueryObject.path;
        if (!path) {
            throw new Error('[Suunta]: Path of routeQueryObject is undefined');
        }
        let queryParameters = undefined;
        let hash = '';
        try {
            const urlObject = new URL(path, window.location.origin);
            path = urlObject.pathname;
            queryParameters = urlObject.searchParams;
            hash = urlObject.hash;
        } catch (_ignored) {
            console.warn('[Suunta]: Failed to parse URL object out of route.');
        }

        const matchedStaticPath = [...this.routes.values()].find(route => route.path === path);
        if (matchedStaticPath) {
            return {
                ...matchedStaticPath,
                queryParameters,
                hash,
            };
        }

        // We didn't match a name, nor a static path. Try to resolve via regex.
        for (const matcherEntry of this.routeMatchers.entries()) {
            const matcher = matcherEntry[0];
            /** @type {RegExpMatchArray | null} */
            const match = path.match(matcher);
            if (!match) {
                continue;
            }
            /** @type { string } */
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
                hash,
            };
        }

        return undefined;
    }

    /**
     * @returns { import("./route").Route | undefined }
     */
    #getRouteFromCurrentURL() {
        const currentURL = new URL(window.location.href);
        let path = currentURL.href.replace(currentURL.origin, '');
        if (this.options.base) {
            path = path.replace(this.options.base, '');
        }

        return this.getRoute({ path });
    }

    /**
     * @typedef NavigationOptions
     * @property { boolean } [pushState]
     * @property { boolean } [isReRender]
     * @property { MouseEvent | null } [originalEvent]
     * */

    /**
     * @param { import("./route").Route | undefined } route
     * @param { NavigationOptions } options
     * @returns {Promise<void>}
     */
    async #navigate(route, { pushState = true, isReRender = false, originalEvent = null } = {}) {
        if (!route) {
            // TODO: Change this path to a 404 page nav etc.
            console.error(`[Suunta]: Could not find a route to navigate to, and no fallback route was set. 
                            To set a fallback route, add one with the matcher '/{notFoundPath}(.*)', or just '/{notFoundPath}'.`);
            return;
        }

        // Don't prevent it until here as we might want to trigger natural navigations on external urls
        originalEvent?.preventDefault();

        if (route.path === this.#currentView?.route.path && !isReRender) {
            return; // same route
        }

        if (this.beforeNavigate) {
            route = await this.beforeNavigate(route);
        }

        this.#currentRoute = route;

        this.#currentView = {
            href: window.location.href,
            route,
            properties: { ...route.properties },
        };

        if (pushState) {
            this.pushHistoryState(route);
        }

        if (route.path === this.#currentNavigationRenderStack.at(-2)?.route.path) {
            // Remove the previous view from stack
            const stackEntry = this.#currentNavigationRenderStack.pop();
            if (stackEntry && stackEntry.renderTarget) {
                const viewToRender = '';
                const routeToRender = /** @type { import('./route.js').ViewRoute } */ (stackEntry.route);
                this.options.renderer(viewToRender, routeToRender, stackEntry.renderTarget);
            }
            const currentStackEntry = this.#currentNavigationRenderStack.at(-1);
            if (currentStackEntry) {
                this.#currentView = {
                    href: window.location.href,
                    route: currentStackEntry.route,
                    properties: { ...currentStackEntry.route.properties },
                };

                this.#currentRenderTarget = currentStackEntry.renderTarget;
                this.#currentRoute = currentStackEntry.route;
            }
            return;
        }

        if (isChildRoute(route)) {
            await this.handleChildRoute(route);
            return;
        }

        // If we are not managing a childRoute, we can empty the stack
        this.#currentNavigationRenderStack = [];

        if (isViewRoute(route)) {
            await this.handleViewRoute(route);
            return;
        }

        if (isRedirectRoute(route)) {
            await this.handleRedirectRoute(route);
            return;
        }
    }

    async reNavigate() {
        return this.#navigate(this.getCurrentRoute(), {
            pushState: false,
            isReRender: true,
        });
    }

    /**
     * @param {import("./route").Route} route
     */
    async handleChildRoute(route) {
        const routeStack = [];
        /** @type { import('./route.js').Route } */
        let r = route;
        while (isChildRoute(r)) {
            routeStack.unshift(r.parent);
            r = r.parent;
        }
        routeStack.push(route);

        const currentStack = this.#currentNavigationRenderStack;

        for (let i = 0; i < routeStack.length; i++) {
            if (currentStack[i]?.route.path === routeStack[i].path) {
                continue;
            }
            const routeToRender = routeStack[i];

            if (isViewRoute(routeToRender)) {
                await this.handleViewRoute(routeToRender);
            }
            if (isRedirectRoute(routeToRender)) {
                await this.handleRedirectRoute(routeToRender);
            }
        }
    }

    /**
     * @param { import("./route").Route } route
     */
    pushHistoryState(route) {
        let pathToWrite = route.path;
        if (this.options.base) {
            pathToWrite = this.options.base + route.path;
        }
        try {
            const urlObject = new URL(pathToWrite, window.location.origin);
            urlObject.hash = route.hash ?? '';
            if (route.queryParameters) {
                // @ts-ignore
                [...route.queryParameters].forEach(qp => urlObject.searchParams.set(qp[0], qp[1]));
            }
            pathToWrite = urlObject.href.replace(urlObject.origin, '');
        } catch (_ignored) {}
        window.history.pushState(null, '', pathToWrite);
    }

    /**
     * @param {import("./route").ViewRoute | import("./route.js").ChildViewRoute} route
     */
    async handleViewRoute(route) {
        /** @type { import("./route").SuuntaTarget | undefined } */
        let parentRenderTarget = undefined;
        if (isChildRoute(route)) {
            parentRenderTarget = this.#currentRenderTarget;
        }

        /** @type { import("./route").RouteView | import("./route.js").ImportedView } */
        let renderableView = route.view;
        this.#currentNavigationRenderStack.push({ route });

        let iterationCount = 0;
        while (renderableView !== null) {
            if (isRenderableView(renderableView)) {
                this.render(renderableView, route, parentRenderTarget);
                break;
            }

            if (isFunction(renderableView)) {
                const stackEntry = this.#currentNavigationRenderStack.at(-1);
                if (stackEntry) {
                    stackEntry.renderFunction = renderableView;
                }
                // @ts-ignore
                renderableView = await renderableView();
            }

            if (isModule(renderableView)) {
                /** @type { import("./route").ImportResult } */
                const exportedView = renderableView.default ?? Object.values(renderableView)[0];
                if (exportedView) {
                    renderableView = exportedView;
                } else {
                    throw new Error('[Suunta]: Could not parse imported route.');
                }
            }
            iterationCount++;
            if (iterationCount > 10) {
                throw new Error('[Suunta]: Could not parse route from View. Recursion level too deep.');
            }
        }
        await waitFrame(2);
        document.dispatchEvent(new CustomEvent(NAVIGATED_EVENT, { detail: { route } }));
    }

    /**
     * @param { import("./route").RedirectRoute } route
     */
    async handleRedirectRoute(route) {
        const redirectTarget = this.getRoute({ name: route.redirect });
        if (!redirectTarget) {
            throw new Error("[Suunta]: Could not redirect to route '" + route.redirect + "' as it could not be found.");
        }
        this.#navigate(redirectTarget);
    }

    /**
     * @param {unknown} viewToRender
     * @param { import("./route").ViewRoute } route
     * @param { import("./route").SuuntaTarget } [parentRenderTarget]
     */
    render(viewToRender, route, parentRenderTarget) {
        let target = this.getTarget(parentRenderTarget, isChildRoute(route));
        this.#currentRenderTarget = target;

        // Set the resolved render target for the topmost item in stack
        const topmostStackItem = this.#currentNavigationRenderStack.at(-1);
        if (topmostStackItem) {
            topmostStackItem.renderTarget = target;
        }

        if (!this.options.renderer) {
            // TODO: Handle special err?
            return;
        }
        // TODO: Mutation observer so that we could attach some kind of a handle to the root of the view?
        this.options.renderer(viewToRender, route, target);
    }

    /**
     * @returns { import("./view").SuuntaView | undefined }
     */
    getCurrentView() {
        return this.#currentView;
    }

    /**
     * @returns { import("./route").Route | undefined }
     */
    getCurrentRoute() {
        return this.#currentRoute;
    }

    getRenderStack() {
        return this.#currentNavigationRenderStack;
    }

    /**
     * @param {import('./route').RenderStackEntry} stackEntry
     */
    async refreshView(stackEntry) {
        const renderFunction = stackEntry.renderFunction;
        const route = stackEntry.route;
        const target = stackEntry.renderTarget;

        const renderResult = await renderFunction?.();

        if (target) {
            this.options.renderer(renderResult, /** @type import('./route.js').ViewRoute */ (route), target);
        }
    }

    /**
     * @param {string} propKey
     * @param {unknown} oldValue
     * @param {unknown} newValue
     */
    triggerOnUpdated(propKey, oldValue, newValue) {
        document.dispatchEvent(new CustomEvent(UPDATED_EVENT, { detail: { property: propKey, oldValue, newValue } }));
    }
}
