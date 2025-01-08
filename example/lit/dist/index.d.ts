import { Route, Suunta } from 'suunta';
export declare let router: Suunta<Route, string> | undefined;
export declare const globalState: {
    count: number;
};
export declare function updateGlobalClicker(val: number): void;
export declare function getGlobalClicker(): number;
