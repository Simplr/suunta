export class Suunta {
    /**
     * @param {import("./route").SuuntaInitOptions<import("./route.js").Route>} options
     */
    constructor(options: import("./route").SuuntaInitOptions<import("./route.js").Route>);
    /** @type { Map<string, import("./route").Route> } */
    routes: Map<string, import("./route").Route>;
    /** @type { Map<RegExp, import("./route").Route> } */
    routeMatchers: Map<RegExp, import("./route").Route>;
    /** @type { boolean } */
    started: boolean;
    /** @type { import("./route").RouteTransformer<import("./route.js").Route> | undefined } */
    beforeNavigate: import("./route").RouteTransformer<import("./route.js").Route> | undefined;
    options: import("./route").SuuntaInitOptions<import("./route").Route>;
    /**
     * @returns { Promise<void> }
     */
    start(): Promise<void>;
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
    reNavigate(): Promise<void>;
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
    getRenderStack(): import("./route").RenderStackEntry[];
    /**
     * @param {import('./route').RenderStackEntry} stackEntry
     */
    refreshView(stackEntry: import("./route").RenderStackEntry): Promise<void>;
    /**
     * @param {string} propKey
     * @param {unknown} oldValue
     * @param {unknown} newValue
     */
    triggerOnUpdated(propKey: string, oldValue: unknown, newValue: unknown): void;
    #private;
}
