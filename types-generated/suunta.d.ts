/**
 * @param { import('./route').Route } route
 * @param { import('./route').Route } otherRoute
 */
export function routeEquals(route: import("./route").Route, otherRoute: import("./route").Route): boolean;
export class Suunta {
    /**
     * @param {import("./route").SuuntaInitOptions} options
     */
    constructor(options: import("./route").SuuntaInitOptions);
    /** @type { import("./route").Route | undefined } */
    currentRoute: import("./route").Route | undefined;
    /** @type { import("./view").SuuntaView | undefined } */
    currentView: import("./view").SuuntaView | undefined;
    /** @type { import("./route").SuuntaTarget | undefined } */
    currentRenderTarget: import("./route").SuuntaTarget | undefined;
    /** @type { Map<string, import("./route").Route> } */
    routes: Map<string, import("./route").Route>;
    /** @type { Map<RegExp, import("./route").Route> } */
    routeMatchers: Map<RegExp, import("./route").Route>;
    /** @type { boolean } */
    started: boolean;
    /** @type { import("./route").RouteTransformer<import("./route.js").Route> | undefined } */
    beforeNavigate: import("./route").RouteTransformer<import("./route.js").Route> | undefined;
    /** @type { import('./route.js').RenderStackEntry[] } */
    currentNavigationRenderStack: import("./route.js").RenderStackEntry[];
    options: import("./route").SuuntaInitOptions<import("./route").Route>;
    mapRoutes(): void;
    /**
     * @param { import("./route").Route } route
     */
    mapRoute(route: import("./route").Route): void;
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
     * @param { import("./route").RouteQueryObject } routeQueryObject
     * @returns { import("./route").Route | undefined }
     */
    getRoute(routeQueryObject: import("./route").RouteQueryObject): import("./route").Route | undefined;
    /**
     * @returns { import("./route").Route | undefined }
     */
    getRouteFromCurrentURL(): import("./route").Route | undefined;
    /**
     * @param {import('./route').Route} route
     * @returns { import('./route').Route[] }
     */
    generateStackFromRoute(route: import("./route").Route): import("./route").Route[];
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
    navigate(route: import("./route").Route | undefined, { pushState, isReRender, originalEvent }?: {
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
     * @param {import("./route").Route} route
     */
    handleChildRoute(route: import("./route").Route): Promise<void>;
    /**
     * @param { import("./route").Route } route
     */
    pushHistoryState(route: import("./route").Route): void;
    /**
     * @param {import("./route").ViewRoute | import("./route.js").ChildViewRoute} route
     */
    handleViewRoute(route: import("./route").ViewRoute | import("./route.js").ChildViewRoute): Promise<void>;
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
     * @returns { import("./route").Route | undefined }
     */
    getCurrentRoute(): import("./route").Route | undefined;
    /**
     * @returns { import('./route').RenderStackEntry[] }
     * */
    getRenderStack(): import("./route").RenderStackEntry[];
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
    /**
     * @param {import('./route').RenderStackEntry} stackEntry
     * @param {string} propKey
     * @param {unknown} oldValue
     * @param {unknown} newValue
     */
    triggerOnUpdated(stackEntry: import("./route").RenderStackEntry, propKey: string, oldValue: unknown, newValue: unknown): void;
}
