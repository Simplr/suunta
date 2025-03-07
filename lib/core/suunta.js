import { createRouteMatcher, WILDCARD_MATCHER } from './matcher.js';
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
import { createNavigationLeaveEventName, NAVIGATED_EVENT, UPDATED_EVENT } from './triggers.js';

/**
 * @template { import('./route').Route } R
 * */
export class Suunta {
    /** @type { R | undefined } */
    currentRoute;
    /** @type { import("./view").SuuntaView | undefined } */
    currentView;
    /** @type { import("./route").SuuntaTarget | undefined } */
    currentRenderTarget;
    /** @type { Readonly<Map<string, R>> } */
    routes = new Map();
    /** @type { Map<string, R> } */
    routesByName = new Map();
    /** @type { Map<RegExp, R> } */
    routeMatchers = new Map();
    /** @type { Map<string, RegExp> } */
    routeMatchersByPath = new Map();
    /** @type { boolean } */
    started = false;
    /** @type { import("./route").RouteTransformer<R> | undefined } */
    beforeNavigate;

    /** @type { import('./route.js').RenderStackEntry[] } */
    currentNavigationRenderStack = [];

    /**
     * @param {import("./route").SuuntaInitOptions<R>} options
     */
    constructor(options) {
        this.options = options;
        if (!this.options.renderer) {
            throw new Error(
                "[Suunta]: No renderer set! Set a router in the Suunta initialization options or use the `suunta` -package with the default Lit renderer.\n\nimport { Suunta } from 'suunta';",
            );
        }
        this.beforeNavigate = options.beforeNavigate;
        this.mapRoutes();
        // @ts-ignore -- This is just a generics error
        initializeRouterForStateOperations(this);
    }

    mapRoutes() {
        this.options.routes.forEach(route => this.mapRoute(route));
    }

    /**
     * @param { R } route
     */
    mapRoute(route) {
        this.routes.set(route.path, route);
        if (route.name) {
            if (this.routesByName.has(route.name)) {
                console.error('Duplicate route name found.', route);
            } else {
                this.routesByName.set(route.name, route);
            }
        }
        const routeMatcher = createRouteMatcher(route.path);
        if (routeMatcher) {
            this.routeMatchers.set(routeMatcher, route);
            this.routeMatchersByPath.set(route.path, routeMatcher);
        }
        if (isViewRoute(route)) {
            route.children?.forEach(childRoute => {
                const relativeChildRoute = /** @type { R } */ ({
                    ...childRoute,
                    path: combinePaths(route.path, childRoute.path),
                    isChild: true,
                    parent: route,
                });
                this.mapRoute(relativeChildRoute);
            });
        }
    }

    /**
     * @returns { Promise<void> }
     */
    async start() {
        const currentRoute = this.getRouteFromCurrentURL();
        this.setupListeners();
        await this.navigate(currentRoute, { pushState: false });
        this.started = true;
    }

    setupListeners() {
        document.body.addEventListener('click', clickEvent => {
            const path = clickEvent.composedPath();
            const closestLink = path
                .filter(
                    el =>
                        /** @type { HTMLAnchorElement } */ (el).href !== null &&
                        /** @type { HTMLAnchorElement } */ (el).href !== undefined &&
                        /** @type { HTMLAnchorElement } */ (el).href !== '',
                )
                .pop();
            if (!closestLink) {
                return;
            }
            const navigationTargetUrl = /** @type { Element } */ (closestLink)?.getAttribute('href') ?? undefined;
            if (!navigationTargetUrl) {
                return;
            }

            try {
                const targetUrl = new URL(navigationTargetUrl);
                if (targetUrl.origin !== window.location.origin) {
                    return;
                }
            } catch (ex) {
                // We couldn't determine if the url is valid. Let's let the
                // rest of the library decide upon that
            }

            const route = this.getRoute({ path: navigationTargetUrl });
            this.navigate(route, { originalEvent: clickEvent });
        });
        window.addEventListener('popstate', () => {
            const currentRoute = this.getRouteFromCurrentURL();
            this.navigate(currentRoute, { pushState: false });
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
            if (outlet) {
                return outlet;
            }
            throw new Error(
                `[Suunta]: No router target nor a outlet tag was set. Create a <suunta-view> element or specify a css selector for target div with\n\n${JSON.stringify(
                    { routes: [], target: '#my-div' },
                    null,
                    4,
                )}\n`,
            );
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
        await this.navigate(route);
    }

    /**
     * @param { import("./route").RouteQueryObject<R> } routeQueryObject
     * @returns { R | undefined }
     */
    getRoute(routeQueryObject) {
        if (routeQueryObject.name) {
            return this.routesByName.get(routeQueryObject.name);
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

        // Clone the route data just in case so that we don't overwrite anything in the source data.
        // @ts-ignore
        const cloneRouteData = route => {
            if (!route) {
                return undefined;
            }

            return {
                path: route.path,
                parent: cloneRouteData(route.parent),
                children: route.children?.map(cloneRouteData),
                name: route.name,
                isChild: route.isChild,
                view: route.view,
            };
        };

        // We didn't match a name, nor a static path. Try to resolve via regex.
        for (const matcherEntry of this.routeMatchers.entries()) {
            const matcher = matcherEntry[0];
            /** @type {RegExpMatchArray | null} */
            const match = path.toString().match(matcher);
            if (!match) {
                continue;
            }
            /** @type { string } */
            const rawMatch = match[0];
            if (path !== rawMatch) {
                continue;
            }

            const matchedRoute = cloneRouteData(matcherEntry[1]);
            // @ts-ignore
            matchedRoute.originalPath = matchedRoute.path;
            // @ts-ignore
            matchedRoute.path = path;

            // Set recursively the parent routes's properties too.
            if (isChildRoute(matchedRoute)) {
                let parent = matchedRoute.parent;

                while (parent) {
                    const parentMatcher = this.routeMatchersByPath.get(parent.path);

                    if (parentMatcher) {
                        const parentMatch = path.toString().match(parentMatcher);
                        if (parentMatch) {
                            const rawMatch = parentMatch[0];

                            // @ts-ignore
                            parent.originalPath = parent.path;
                            // @ts-ignore
                            parent.path = rawMatch;
                            parent.params = { ...parentMatch.groups };
                            parent.queryParameters = queryParameters;
                            parent.hash = hash;
                        }
                    }

                    if (isChildRoute(parent)) {
                        parent = parent.parent;
                    } else {
                        break;
                    }
                }
            }

            return {
                ...matchedRoute,
                params: { ...match.groups },
                queryParameters,
                hash,
            };
        }

        return undefined;
    }

    /**
     * @returns { R | undefined }
     */
    getRouteFromCurrentURL() {
        const currentURL = new URL(window.location.href);
        let path = currentURL.href.replace(currentURL.origin, '');
        if (this.options.base) {
            path = path.replace(this.options.base, '');
        }

        return this.getRoute({ path });
    }

    /**
     * @param {R} route
     * @returns { R[] }
     */
    generateStackFromRoute(route) {
        const stack = [];
        /** @type {any} */
        let parent = route;
        while (parent) {
            stack.unshift(parent);
            parent = parent.parent;
        }

        return stack;
    }

    /**
     * @typedef NavigationOptions
     * @property { boolean } [pushState]
     * @property { boolean } [isReRender]
     * @property { MouseEvent | null } [originalEvent]
     * */

    /**
     * @param { R | undefined } route
     * @param { NavigationOptions } options
     * @returns {Promise<void>}
     */
    async navigate(route, { pushState = true, isReRender = false, originalEvent = null } = {}) {
        if (!route) {
            // TODO: Change this path to a 404 page nav etc.
            console.error(`[Suunta]: Could not find a route to navigate to, and no fallback route was set. 
                            To set a fallback route, add one with the matcher '/{notFoundPath}(.*)', or just '/{notFoundPath}'.`);
            return;
        }

        // Don't prevent it until here as we might want to trigger natural navigations on external urls
        originalEvent?.preventDefault();

        if (route.path === this.currentView?.route.path && !isReRender) {
            return; // same route
        }

        if (this.beforeNavigate) {
            route = await this.beforeNavigate(route);
        }

        this.currentRoute = route;
        const routeStack = this.generateStackFromRoute(route);

        this.currentView = {
            href: window.location.href,
            route,
            properties: route.properties,
            params: { ...route.params },
        };

        if (pushState) {
            this.pushHistoryState(route);
        }

        // @ts-ignore
        if (window.__SUUNTA_DEBUG) {
            debugger;
        }

        // Clear stack entries not matching
        for (let i = Math.max(routeStack.length, this.currentNavigationRenderStack.length) - 1; i > 0; i--) {
            const routeEntry = routeStack[i];
            const stackEntry = this.currentNavigationRenderStack[i];

            if (stackEntry && !routeEquals(routeEntry, stackEntry?.route)) {
                this.sendLeavingViewEvent(stackEntry);
                // If we are about to navigate to the same view, but with different params, don't un-render, just paint on top of it.
                if (routeEntry?.name !== stackEntry?.route.name && i !== routeStack.length - 1) {
                    await this.emptyStackEntryRenderTarget(stackEntry);
                }
                this.manageEmptiedStackEntryState(stackEntry);
                this.currentNavigationRenderStack.splice(i, 1);
            }
        }

        // If stacks match, just return early.
        if (
            this.currentNavigationRenderStack.length === routeStack.length &&
            this.currentNavigationRenderStack.every((entry, i) => routeEquals(routeStack[i], entry.route))
        ) {
            return;
        }

        if (isChildRoute(route)) {
            await this.handleChildRoute(route);
            return;
        }

        // If we are not managing a childRoute, we can empty the stack.
        // Before that, we send in currency-order a leaving message.
        this.currentNavigationRenderStack.reverse().forEach(entry => this.sendLeavingViewEvent(entry));
        this.currentNavigationRenderStack = [];

        if (isViewRoute(route)) {
            this.currentNavigationRenderStack.push({ route, eventTarget: new EventTarget(), viewStates: [] });
            await this.handleViewRoute(route);
            return;
        }

        if (isRedirectRoute(route)) {
            await this.handleRedirectRoute(route);
            return;
        }
    }

    async reNavigate() {
        return this.navigate(this.getCurrentRoute(), {
            pushState: false,
            isReRender: true,
        });
    }

    /**
     * @param {import('./route').RenderStackEntry} stackEntry
     */
    async emptyStackEntryRenderTarget(stackEntry) {
        const viewToRender = '';
        const routeToRender = /** @type { import('./route.js').ViewRoute } */ (stackEntry.route);
        if (stackEntry.renderTarget) {
            await this.options.renderer(viewToRender, routeToRender, stackEntry.renderTarget, false, true);
        }
    }

    /**
     * @param {import('./route').RenderStackEntry} stackEntry
     */
    manageEmptiedStackEntryState(stackEntry) {
        stackEntry.viewStates?.forEach(state => {
            if (state && state.connected) {
                state.connected = false;
            }
        });
    }

    /**
     * @param {R} route
     */
    async handleChildRoute(route) {
        const routeStack = this.generateStackFromRoute(route);

        const currentStack = this.currentNavigationRenderStack;

        for (let i = 0; i < routeStack.length; i++) {
            if (routeEquals(currentStack[i]?.route, routeStack[i])) {
                continue;
            }
            const routeToRender = routeStack[i];

            if (isViewRoute(routeToRender)) {
                this.currentNavigationRenderStack.push({
                    route: routeToRender,
                    eventTarget: new EventTarget(),
                    viewStates: [],
                });
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
            const stackParent = this.getRenderStack().at(-2);
            parentRenderTarget = stackParent?.renderTarget;
        }

        /** @type { import("./route").RouteView | import("./route.js").ImportedView } */
        let renderableView = route.view;

        let iterationCount = 0;
        while (renderableView !== null) {
            if (isRenderableView(renderableView)) {
                this.render(renderableView, route, parentRenderTarget);
                break;
            }

            if (isFunction(renderableView)) {
                const stackEntry = this.currentNavigationRenderStack.at(-1);
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
     * @param {import('./route').RenderStackEntry} stackEntry
     */
    sendLeavingViewEvent(stackEntry) {
        const eventName = createNavigationLeaveEventName(stackEntry);
        document.dispatchEvent(new CustomEvent(eventName, { detail: { stackEntry } }));
    }

    /**
     * @param { import("./route").RedirectRoute } route
     */
    async handleRedirectRoute(route) {
        const redirectTarget = this.getRoute({ name: route.redirect });
        if (!redirectTarget) {
            throw new Error("[Suunta]: Could not redirect to route '" + route.redirect + "' as it could not be found.");
        }
        this.navigate(redirectTarget);
    }

    /**
     * @param {unknown} viewToRender
     * @param { import("./route").ViewRoute } route
     * @param { import("./route").SuuntaTarget } [parentRenderTarget]
     */
    render(viewToRender, route, parentRenderTarget) {
        let target = this.getTarget(parentRenderTarget, isChildRoute(route));
        this.currentRenderTarget = target;

        // Set the resolved render target for the topmost item in stack
        const topmostStackItem = this.currentNavigationRenderStack.at(-1);
        if (topmostStackItem) {
            topmostStackItem.renderTarget = target;
        }

        if (!this.options.renderer) {
            return;
        }

        this.options.renderer(viewToRender, route, target, false, false);
        if (route.title) {
            document.title = route.title;
        }
    }

    /**
     * @returns { import("./view").SuuntaView | undefined }
     */
    getCurrentView() {
        return this.currentView;
    }

    /**
     * @returns { R | undefined }
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * @returns { import('./route').RenderStackEntry[] }
     * */
    getRenderStack() {
        return this.currentNavigationRenderStack;
    }

    /**
     *
     * Resolves the path of a route given the name of the route.
     *
     * ## Example
     *
     * ```js
     * const routes = [
     *  { path: "/", name: "Home" },
     *  { path: "/user/:id", name: "User" },
     * ]
     *
     * <a href="${router.resolve('Home')}">Go Home</a>
     * // Resolves to
     * <a href="/">Go Home</a>
     *
     * <a href="${router.resolve('User', 123)}">Go Home</a>
     * // Resolves to
     * <a href="/user/123">Go to User Profile</a>
     * ```
     *
     *
     * @template { import('./route').RouteNames<R> } N
     *
     * @param {N} routeName - Name property of the route
     * @param {any[]} params - Dynamic parameters of the route, in order.
     *
     * @returns {R["path"] | undefined}
     */
    resolve(routeName, ...params) {
        return this.pathByRouteName(routeName, ...params);
    }

    /**
     * @template { import('./route').RouteNames<R> } N
     *
     * @param {N} routeName
     * @param {any[]} params
     *
     * @returns {R["path"] | undefined}
     */
    pathByRouteName(routeName, ...params) {
        if (!routeName) {
            return undefined;
        }

        if (!params || params.length === 0) {
            return this.routesByName.get(routeName)?.path;
        }

        const routeByName = this.routesByName.get(routeName);
        if (!routeByName) {
            console.error(`[Suunta]: No route found with name "${routeName}"`);
            return undefined;
        }

        let routePath = routeByName.path;
        while (params.length > 0) {
            const param = params.shift();

            routePath = routePath.replace(WILDCARD_MATCHER, param);
        }

        return routePath;
    }

    /**
     * @param {import('./route').RenderStackEntry} stackEntry
     * @param {import('./route').RenderStackEntry} [previousEntry]
     */
    async refreshView(stackEntry, previousEntry) {
        const renderFunction = stackEntry.renderFunction;
        const route = stackEntry.route;
        const target = stackEntry.renderTarget;

        const renderResult = await renderFunction?.();

        if (target && target.isConnected) {
            await this.options.renderer(
                renderResult,
                /** @type import('./route.js').ViewRoute */ (route),
                target,
                true,
                false,
            );
        } else {
            // If a full refresh (or any other reason) wiped our target,
            // we need to find it again. To do this, we find it the same we did
            // the original one while rendering. Don't pass the previousEntry again
            // to avoid stack overflows.
            if (previousEntry) {
                this.resetStackEntryRenderTarget(stackEntry);
                await this.refreshView(stackEntry);
            }
        }
    }

    /**
     * @param { import('./route').RenderStackEntry } stackEntry
     * */
    resetStackEntryRenderTarget(stackEntry) {
        const stack = this.getRenderStack();
        let indexInStack = 0;
        for (let i = 0; i < stack.length; i++) {
            if (stack[i] === stackEntry) {
                indexInStack = i;
                break;
            }
        }
        if (indexInStack == 0) {
            return;
        }

        const stackParent = stack[indexInStack - 1];
        const target = this.getTarget(stackParent.renderTarget, true);
        stackEntry.renderTarget = target;
    }

    /**
     * Refreshes all of views and subviews in stack in stack order.
     *
     * Useful for cases where you update a global variable, e.g. localizations and want to apply the changes to all views.
     * */
    async refreshAllViews() {
        let previousRefresh = undefined;
        for (const entry of this.getRenderStack()) {
            await this.refreshView(entry, previousRefresh);
            previousRefresh = entry;
        }
    }

    async refreshCurrentView() {
        const entry = this.getRenderStack().at(-1);
        if (entry) {
            await this.refreshView(entry);
        }
    }

    /**
     * @param {import('./route').RenderStackEntry} stackEntry
     * @param { import('./state.js').UpdatedProperties} updatedProperties
     */
    triggerOnUpdated(stackEntry, updatedProperties) {
        stackEntry.eventTarget.dispatchEvent(new CustomEvent(UPDATED_EVENT, { detail: updatedProperties }));
    }
}

/**
 * @param { import('./route').Route } route
 * @param { import('./route').Route } otherRoute
 */
export function routeEquals(route, otherRoute) {
    if (!route || !otherRoute) {
        return false;
    }

    // @ts-ignore
    const routePath = route.originalPath || route.path;
    // @ts-ignore
    const otherRoutePath = otherRoute.originalPath || otherRoute.path;

    return (
        routePath === otherRoutePath &&
        /** @type { import('./route').ChildViewRoute } */ (route).parent?.path ===
            /** @type { import('./route').ChildViewRoute } */ (otherRoute).parent?.path &&
        route.name === otherRoute.name &&
        route.properties === otherRoute.properties &&
        JSON.stringify(route.params) === JSON.stringify(otherRoute.params)
    );
}
