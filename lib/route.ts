import { TemplateResult } from "lit-html";
import { ViewProperties } from "./view";

type Lazy<T> = () => Promise<T>;
export type ImportedView = { default: RenderableView };
export type LazyImportedRouteView = Lazy<ImportedView>;
export type RouteView = RenderableView | Lazy<RenderableView> | LazyImportedRouteView | any;
export type RenderableView = string | TemplateResult;
// type RouteViewFunction = (() => RouteView) | (() => Promise<RouteView>) | (<T>() => Promise<T>);

export type Route = ViewRoute | RedirectRoute;

interface BaseRoute {
    path: string;
    name?: string;
    properties?: ViewProperties;
}

export interface ViewRoute extends BaseRoute {
    view: RouteView;
}

export interface RedirectRoute extends BaseRoute {
    redirect: string;
}

export function isViewRoute(route: Route): route is ViewRoute {
    return route.hasOwnProperty("view");
}

export function isRedirectRoute(route: Route): route is RedirectRoute {
    return route.hasOwnProperty("redirect");
}

export interface RouteQueryObject {
    name?: string;
    path?: string;
}
