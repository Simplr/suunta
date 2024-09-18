/**
 * @param { import("./suunta").Suunta } routerInstance
 * */
export function initializeRouterForStateOperations(routerInstance: import("./suunta").Suunta): void;
/**
 * @param { T } initialState
 * @template { Record<string, unknown> } T
 * @returns { T }
 * */
export function createState<T extends Record<string, unknown>>(initialState: T): T;
/**
 * @param {Record<string, unknown>} stateObject
 * @param {import("./suunta").Suunta} router
 * @param {import("./route").RenderStackEntry} stackEntry
 */
export function getStateProxy(stateObject: Record<string, unknown>, router: import("./suunta").Suunta, stackEntry: import("./route").RenderStackEntry): any;
/** @type { import("./suunta").Suunta | undefined } */
export let router: import("./suunta").Suunta | undefined;
