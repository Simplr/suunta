/** @typedef {(property: string, oldValue: unknown, newValue: unknown) => any} OnUpdateFunction */
/**
 * @param { EventListenerOrEventListenerObject } onNavigationFunction
 */
export function onNavigation(onNavigationFunction: EventListenerOrEventListenerObject): void;
/**
 * @param { OnUpdateFunction } onUpdatedFunction
 */
export function onUpdated(onUpdatedFunction: OnUpdateFunction): void;
export const NAVIGATED_EVENT: "suunta-navigated";
export const UPDATED_EVENT: "suunta-updated";
export type OnUpdateFunction = (property: string, oldValue: unknown, newValue: unknown) => any;
