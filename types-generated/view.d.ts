import { Route } from "./route";
export type ViewProperties = Record<string, unknown>;
export interface SuuntaView {
    href: string;
    route: Route;
    properties: ViewProperties;
}
