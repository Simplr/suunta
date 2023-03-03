import { Route } from "./route";

export type ViewProperties = Record<string, unknown>;

export interface SuuntaView {
    fullPath: string;
    route: Route;
    properties: ViewProperties;
}
