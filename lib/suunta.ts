import { Route } from "./route";
import { SuuntaView } from "./view";

export interface SuuntaInitOptions {
    routes: Route[];
    base?: string;
}


export class Suunta {

    #currentView: SuuntaView | undefined;
    public started = false;

    constructor(private options: SuuntaInitOptions) {
    }

    public start() {
        this.started = true;
        const currentRoute = this.formRouteFromCurrentURL();
        if (!currentRoute) {
            // TODO: Change this path to a 404 page nav etc.
            throw new Error("Could not find a route to navigate to.");
        }
        this.navigate(currentRoute);
    }

    private formRouteFromCurrentURL(): Route | undefined {
        const currentURL = new URL(window.location.href);
        console.log(currentURL);

        return undefined;
    }

    public navigate(route: Route) {

    }

    public getCurrentView() {
        return this.#currentView;
    }
}
