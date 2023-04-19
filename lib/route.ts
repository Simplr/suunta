import { TemplateResult } from "lit-html";
import { ViewProperties } from "./view";

export type Lazy<T> = () => Promise<T>;
export type RenderFunction = () => RenderableView;
export type ImportResult = RenderableView | Lazy<RenderableView> | RenderFunction | undefined;
export type ImportedView = Record<string, ImportResult>;
export type LazyImportedRouteView = Lazy<ImportedView>;
export type RouteView = RenderableView | Lazy<RenderableView> | LazyImportedRouteView | RenderFunction;
export type RenderableView = string | TemplateResult;

export type Route = ViewRoute | RedirectRoute;

interface BaseRoute {
    path: string;
    name?: string;
    properties?: ViewProperties;
}

export interface ViewRoute extends BaseRoute {
    view: RouteView;
    children?: ViewRoute[]
}

export interface ChildViewRoute extends ViewRoute {
    isChild: true,
    parent: ViewRoute
}

export interface RedirectRoute extends BaseRoute {
    redirect: string;
}

export function isViewRoute(route: Route): route is ViewRoute {
    return route.hasOwnProperty("view");
}

export function isChildRoute(route: Route): route is ChildViewRoute {
    return route.hasOwnProperty("isChild") && (route as ChildViewRoute).isChild === true;
}

export function isRedirectRoute(route: Route): route is RedirectRoute {
    return route.hasOwnProperty("redirect");
}

export function combinePaths(first: string, second: string): string {
    const firstNeedsDelimiter = !first.endsWith("/");
    const secondNeedsDelimiter = !second.startsWith("/");
    if (firstNeedsDelimiter && secondNeedsDelimiter) {
        return `${first}/${second}`;
    }
    if (!firstNeedsDelimiter && !secondNeedsDelimiter) {
        return first + second.substring(1);
    }

    return first + second;
}

export interface RouteQueryObject {
    name?: string;
    path?: string;
}
