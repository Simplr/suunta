/**
 * @param { import('./route').Route } route
 * @param { import('./route').Route } otherRoute
 */
export function routeEquals(route: import("./route").Route, otherRoute: import("./route").Route): boolean;
/**
 * @template { import('./route').Route } R
 * */
export class Suunta<R extends import("./route").Route> {
    /**
     * @param {import("./route").SuuntaInitOptions<R>} options
     */
    constructor(options: import("./route").SuuntaInitOptions<R>);
    /** @type { R | undefined } */
    currentRoute: R | undefined;
    /** @type { import("./view").SuuntaView | undefined } */
    currentView: import("./view").SuuntaView | undefined;
    /** @type { import("./route").SuuntaTarget | undefined } */
    currentRenderTarget: import("./route").SuuntaTarget | undefined;
    /** @type { Readonly<Map<string, R>> } */
    routes: Readonly<Map<string, R>>;
    /** @type { Map<string, R> } */
    routesByName: Map<string, R>;
    /** @type { Map<RegExp, R> } */
    routeMatchers: Map<RegExp, R>;
    /** @type { Map<string, RegExp> } */
    routeMatchersByPath: Map<string, RegExp>;
    /** @type { boolean } */
    started: boolean;
    /** @type { import("./route").RouteTransformer<R> | undefined } */
    beforeNavigate: import("./route").RouteTransformer<R> | undefined;
    /** @type { import('./route.js').RenderStackEntry[] } */
    currentNavigationRenderStack: import("./route.js").RenderStackEntry[];
    options: import("./route").SuuntaInitOptions<R>;
    mapRoutes(): void;
    /**
     * @param { R } route
     */
    mapRoute(route: R): void;
    /**
     * @returns { Promise<void> }
     */
    start(): Promise<void>;
    setupListeners(): void;
    /**
     * @param { import("./route").SuuntaTarget } [parentRenderTarget]
     * @param { boolean } [routeIsChildRoute]
     * @returns { import("./route").SuuntaTarget }
     */
    getTarget(parentRenderTarget?: import("./route").SuuntaTarget | undefined, routeIsChildRoute?: boolean | undefined): import("./route").SuuntaTarget;
    /**
     * @param { { name: string } | { path: string } } routeQueryObject
     * @returns { Promise<void> }
     */
    navigateTo(routeQueryObject: {
        name: string;
    } | {
        path: string;
    }): Promise<void>;
    /**
     * @param { import("./route").RouteQueryObject<R> } routeQueryObject
     * @returns { R | undefined }
     */
    getRoute(routeQueryObject: import("./route").RouteQueryObject<R>): R | undefined;
    /**
     * @returns { R | undefined }
     */
    getRouteFromCurrentURL(): R | undefined;
    /**
     * @param {R} route
     * @returns { R[] }
     */
    generateStackFromRoute(route: R): R[];
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
    navigate(route: R | undefined, { pushState, isReRender, originalEvent }?: {
        pushState?: boolean | undefined;
        isReRender?: boolean | undefined;
        originalEvent?: MouseEvent | null | undefined;
    }): Promise<void>;
    reNavigate(): Promise<void>;
    /**
     * @param {import('./route').RenderStackEntry} stackEntry
     */
    emptyStackEntryRenderTarget(stackEntry: import("./route").RenderStackEntry): Promise<void>;
    /**
     * @param {import('./route').RenderStackEntry} stackEntry
     */
    manageEmptiedStackEntryState(stackEntry: import("./route").RenderStackEntry): void;
    /**
     * @param {R} route
     */
    handleChildRoute(route: R): Promise<void>;
    /**
     * @param { import("./route").Route } route
     */
    pushHistoryState(route: import("./route").Route): void;
    /**
     * @param {import("./route").ViewRoute | import("./route.js").ChildViewRoute} route
     */
    handleViewRoute(route: import("./route").ViewRoute | import("./route.js").ChildViewRoute): Promise<void>;
    /**
     * @param {import('./route').RenderStackEntry} stackEntry
     */
    sendLeavingViewEvent(stackEntry: import("./route").RenderStackEntry): void;
    /**
     * @param { import("./route").RedirectRoute } route
     */
    handleRedirectRoute(route: import("./route").RedirectRoute): Promise<void>;
    /**
     * @param {unknown} viewToRender
     * @param { import("./route").ViewRoute } route
     * @param { import("./route").SuuntaTarget } [parentRenderTarget]
     */
    render(viewToRender: unknown, route: import("./route").ViewRoute, parentRenderTarget?: import("./route").SuuntaTarget | undefined): void;
    /**
     * @returns { import("./view").SuuntaView | undefined }
     */
    getCurrentView(): import("./view").SuuntaView | undefined;
    /**
     * @returns { R | undefined }
     */
    getCurrentRoute(): R | undefined;
    /**
     * @returns { import('./route').RenderStackEntry[] }
     * */
    getRenderStack(): import("./route").RenderStackEntry[];
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
    resolve<N extends import("./route").RouteNames<R>>(routeName: N, ...params: any[]): R["path"] | undefined;
    /**
     * @template { import('./route').RouteNames<R> } N
     *
     * @param {N} routeName
     * @param {any[]} params
     *
     * @returns {R["path"] | undefined}
     */
    pathByRouteName<N extends import("./route").RouteNames<R>>(routeName: N, ...params: any[]): R["path"] | undefined;
    /**
     * @param {import('./route').RenderStackEntry} stackEntry
     * @param {import('./route').RenderStackEntry} [previousEntry]
     */
    refreshView(stackEntry: import("./route").RenderStackEntry, previousEntry?: import("./route").RenderStackEntry | undefined): Promise<void>;
    /**
     * @param { import('./route').RenderStackEntry } stackEntry
     * */
    resetStackEntryRenderTarget(stackEntry: import("./route").RenderStackEntry): void;
    /**
     * Refreshes all of views and subviews in stack in stack order.
     *
     * Useful for cases where you update a global variable, e.g. localizations and want to apply the changes to all views.
     * */
    refreshAllViews(): Promise<void>;
    refreshCurrentView(): Promise<void>;
    /**
     * @param {import('./route').RenderStackEntry} stackEntry
     * @param {string} propKey
     * @param {unknown} oldValue
     * @param {unknown} newValue
     */
    triggerOnUpdated(stackEntry: import("./route").RenderStackEntry, propKey: string, oldValue: unknown, newValue: unknown): void;
}
