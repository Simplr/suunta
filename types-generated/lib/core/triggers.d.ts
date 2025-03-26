/** @typedef {(updatedProperties: import('./state').UpdatedProperties) => any} OnUpdateFunction */
/**
 * @param { EventListenerOrEventListenerObject } onNavigationFunction
 */
export function onNavigation(onNavigationFunction: EventListenerOrEventListenerObject): void;
/**
 * @param { EventListenerOrEventListenerObject } onNavigationLeaveFunction
 */
export function onNavigationLeave(onNavigationLeaveFunction: EventListenerOrEventListenerObject): void;
/**
 * @param {import('./route').RenderStackEntry} stackEntry
 */
export function createNavigationLeaveEventName(stackEntry: import("./route").RenderStackEntry): string;
/**
 * @param { OnUpdateFunction } onUpdatedFunction
 */
export function onUpdated(onUpdatedFunction: OnUpdateFunction): void;
export const NAVIGATED_EVENT: "suunta-navigated";
export const NAVIGATED_LEAVE_EVENT: "suunta-navigated-leave";
export const UPDATED_EVENT: "suunta-updated";
export type OnUpdateFunction = (updatedProperties: import("./state").UpdatedProperties) => any;
