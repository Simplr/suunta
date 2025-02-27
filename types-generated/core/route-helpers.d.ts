/**
 * @param { import("./route").Route } route
 * @returns { route is import("./route").ViewRoute }
 */
export function isViewRoute(route: import("./route").Route): route is import("./route").ViewRoute;
/**
 * @param { import("./route").Route } [route]
 * @returns { route is import("./route").ChildViewRoute }
 */
export function isChildRoute(route?: import("./route").Route | undefined): route is import("./route").ChildViewRoute;
/**
 * @param { import("./route").Route } route
 * @returns { route is import("./route").RedirectRoute }
 */
export function isRedirectRoute(route: import("./route").Route): route is import("./route").RedirectRoute;
/**
 * @param { string } first
 * @param { string } second
 * @returns { string }
 */
export function combinePaths(first: string, second: string): string;
/**
 * Ugly type hack until I come up with something better to type it
 * @param { unknown } something
 * @returns { something is import("./route").ImportedView }
 */
export function isModule(something: unknown): something is import("./route").ImportedView;
/**
 * @param { import("./route").RouteView | import("./route").ImportedView } view
 * @returns { view is import("./route").RenderableView }
 */
export function isRenderableView(view: import("./route").RouteView | import("./route").ImportedView): view is import("./route").RenderableView;
/**
 * Lmao we could make this declaration less ugly
 * @param { import("./route").RouteView | import("./route").ImportedView } view
 * @returns { view is import("./route").Lazy<import("./route").RenderableView> | import("./route").LazyImportedRouteView }
 */
export function isFunction(view: import("./route").RouteView | import("./route").ImportedView): view is import("./route").Lazy<import("./route").RenderableView> | import("./route").LazyImportedRouteView;
/**
 * @returns { Promise<void> }
 */
export function waitFrame(count?: number): Promise<void>;
