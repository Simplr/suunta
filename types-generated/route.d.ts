import { ViewProperties } from './view';
export type Lazy<T> = () => Promise<T>;
export type RenderFunction = () => RenderableView;
export type ImportResult = RenderableView | Lazy<RenderableView> | RenderFunction | undefined;
export type ImportedView = Record<string, ImportResult>;
export type LazyImportedRouteView = Lazy<ImportedView>;
export type RouteView = RenderableView | Lazy<RenderableView> | LazyImportedRouteView | RenderFunction;
export type RenderableView = unknown;
export type Route = ViewRoute | RedirectRoute | ChildViewRoute;
export type RouteNames<R extends Route> = R['name'] | (R extends {
    children: readonly Route[];
} ? RouteNames<R['children'][number]> : never);
export type RoutePaths<R extends Route> = R['path'] | (R extends {
    children: readonly Route[];
} ? RoutePaths<R['children'][number]> : never);
export interface RouteQueryObject<R extends Route> {
    name?: RouteNames<R>;
    path?: RoutePaths<R>;
}
export interface RenderStackEntry {
    route: Route;
    eventTarget: EventTarget;
    renderTarget?: SuuntaTarget;
    renderFunction?: RenderFunction;
    viewState?: ViewState;
}
export interface ViewState {
    state: unknown;
    connected: boolean;
}
export type SuuntaTarget = HTMLElement | DocumentFragment;
export type RouteTransformer<R> = (route: R) => R | Promise<R>;
export interface SuuntaInitOptions<R extends Route = Route> {
    routes: readonly R[];
    renderer: (viewToRender: unknown, route: ViewRoute, renderTarget: SuuntaTarget, isUpdate: boolean, isUnRender: boolean) => void | Promise<void>;
    beforeNavigate?: RouteTransformer<R>;
    target?: string | SuuntaTarget;
    base?: string;
}
interface BaseRoute {
    /**
     * The path to match this route to in your application.
     * */
    readonly path: string;
    /**
     * The document title for said view. Is automatically set when view is rendered.
     * */
    title?: string;
    /**
     * Name of the route. Is used by functions like `pathByRouteName` and `getRoute`.
     * */
    name?: string;
    /**
     * Hardcoded properties to set to certain views. For example for marking views that require authentication.
     *
     * Can be accessed through `router.getCurrentRoute().properties`
     * */
    properties?: ViewProperties;
    /**
     * Path parameters of a dynamic path.
     * */
    params?: ViewProperties;
    /**
     * @internal
     * */
    queryParameters?: URLSearchParams;
    /**
     * @internal
     * */
    hash?: string;
}
export interface ViewRoute extends BaseRoute {
    view: RouteView;
    children?: readonly Route[];
}
export interface ChildViewRoute extends ViewRoute {
    /**
     * @internal
     * */
    isChild: true;
    parent: ViewRoute;
}
export interface RedirectRoute extends BaseRoute {
    redirect: string;
}
export {};
