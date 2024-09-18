import { ViewProperties } from './view';

export type Lazy<T> = () => Promise<T>;
export type RenderFunction = () => RenderableView;
export type ImportResult = RenderableView | Lazy<RenderableView> | RenderFunction | undefined;
export type ImportedView = Record<string, ImportResult>;
export type LazyImportedRouteView = Lazy<ImportedView>;
export type RouteView = RenderableView | Lazy<RenderableView> | LazyImportedRouteView | RenderFunction;
export type RenderableView = unknown;

export type Route = ViewRoute | RedirectRoute | ChildViewRoute;
export interface RenderStackEntry {
    route: Route;
    eventTarget: EventTarget;
    renderTarget?: SuuntaTarget;
    renderFunction?: RenderFunction;
}

export type SuuntaTarget = HTMLElement | DocumentFragment;
export type RouteTransformer<R> = (route: R) => R | Promise<R>;

export interface SuuntaInitOptions<R extends Route = Route> {
    routes: readonly Route[];
    renderer: (viewToRender: unknown, route: ViewRoute, renderTarget: SuuntaTarget, isUpdate: boolean) => void | Promise<void>;
    beforeNavigate?: RouteTransformer<R>;
    target?: string | SuuntaTarget;
    base?: string;
}

interface BaseRoute {
    path: string;
    name?: string;
    properties?: ViewProperties;
    queryParameters?: URLSearchParams;
    hash?: string;
}

export interface ViewRoute extends BaseRoute {
    view: RouteView;
    children?: ViewRoute[];
}

export interface ChildViewRoute extends ViewRoute {
    isChild: true;
    parent: ViewRoute;
}

export interface RedirectRoute extends BaseRoute {
    redirect: string;
}

export interface RouteQueryObject {
    name?: string;
    path?: string;
}
