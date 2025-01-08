/**
 *
 * @param { import("./suunta").Suunta<R, RouteName> } routerInstance
 * */
export function initializeRouterForStateOperations(routerInstance: import("./suunta").Suunta<R, RouteName>): void;
/**
 * @param { T } initialState
 * @template { Record<string, unknown> } T
 * @returns { T }
 * */
export function createState<T extends Record<string, unknown>>(initialState: T): T;
/**
 * createGlobalState should be used with caution. For regular view state, use `createState` and if you
 * for some reason really want to create a GLOBAL reactive state object, only then use `createGlobalState`.
 *
 * `createGlobalState` works like `createState` but triggers an refresh on ALL views in the
 * viewstack on property changes. For applications that don't utilize Child Routes, this won't really act different
 * from the normal state objects, but for applications with Child Views implemented, this might affect performance.
 *
 * @param { T } initialState
 * @template { Record<string, unknown> } T
 * @returns { T }
 * */
export function createGlobalState<T extends Record<string, unknown>>(initialState: T): T;
/**
 * @param {Record<string, unknown>} stateObject
 * @param { import("./suunta").Suunta<R, RouteName> } router
 * @param {import("./route").RenderStackEntry | true} stackEntry
 */
export function getStateProxy(stateObject: Record<string, unknown>, router: import("./suunta").Suunta<R, RouteName>, stackEntry: import("./route").RenderStackEntry | true): any;
/**
 * @template { import('./route').Route } R
 * @template { R["name"] } RouteName
 * */
/**
 * @type { import("./suunta").Suunta<R, RouteName> | undefined }
 * */
export let _suunta_router_instance_for_private_use: import("./suunta").Suunta<R, RouteName> | undefined;
