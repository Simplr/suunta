import { TemplateResult } from "lit-html";
import { ViewProperties } from "./view";

export type RouteView = string | TemplateResult;

export interface Route {
    path: string;
    view: RouteView;
    name?: string;
    properties?: ViewProperties;
}
