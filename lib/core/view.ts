import { Route } from './route.js';

export type ViewProperties = Record<string, unknown>;

export interface SuuntaView {
    href: string;
    route: Route;
    properties?: ViewProperties;
    params?: ViewProperties;
}
