import { TemplateResult } from "lit-html";
import { ViewProperties } from "./view";

export type RouteView = string | TemplateResult;

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
