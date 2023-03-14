import { TemplateResult } from "lit-html";
import { ViewProperties } from "./view";

export type RouteView = string | TemplateResult | RouteViewFunction;

type RouteViewFunction = (() => RouteView) | (() => Promise<RouteView>);

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
