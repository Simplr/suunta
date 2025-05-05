import { Suunta } from 'suunta';
import { Route } from 'suunta/route';
export declare let router: Suunta<Route> | undefined;
export declare const globalState: {
    count: number;
};
export declare function updateGlobalClicker(val: number): void;
export declare function getGlobalClicker(): number;
