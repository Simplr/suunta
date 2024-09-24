import { _suunta_router_instance_for_private_use } from './state';

export const NAVIGATED_EVENT = 'suunta-navigated';
export const NAVIGATED_LEAVE_EVENT = 'suunta-navigated-leave';
export const UPDATED_EVENT = 'suunta-updated';

/** @typedef {(property: string, oldValue: unknown, newValue: unknown) => any} OnUpdateFunction */

/**
 * @param { EventListenerOrEventListenerObject } onNavigationFunction
 */
export function onNavigation(onNavigationFunction) {
    document.addEventListener(NAVIGATED_EVENT, onNavigationFunction, { once: true });
}

/**
 * @param { EventListenerOrEventListenerObject } onNavigationLeaveFunction
 */
export function onNavigationLeave(onNavigationLeaveFunction) {
    const stackEntry = _suunta_router_instance_for_private_use?.getRenderStack().at(-1);
    const eventName = stackEntry ? createNavigationLeaveEventName(stackEntry) : NAVIGATED_LEAVE_EVENT;
    console.log('Listening for ', eventName);
    document.addEventListener(eventName, onNavigationLeaveFunction, { once: true });
}

/**
 * @param {import('./route').RenderStackEntry} stackEntry
 */
export function createNavigationLeaveEventName(stackEntry) {
    return NAVIGATED_LEAVE_EVENT + '-' + stackEntry.route.path;
}

/**
 * @param { OnUpdateFunction } onUpdatedFunction
 */
export function onUpdated(onUpdatedFunction) {
    if (!_suunta_router_instance_for_private_use) {
        console.warn('[Suunta]: Calling onUpdated before initializing router.');
        return;
    }
    const stackEntry = _suunta_router_instance_for_private_use.getRenderStack().at(-1);
    if (!stackEntry) {
        console.warn('[Suunta]: Calling onUpdated outside of a view.');
        return;
    }

    stackEntry.eventTarget.addEventListener(UPDATED_EVENT, event => {
        const eventDetail = /** @type { CustomEvent } */ (event).detail;
        const { property, oldValue, newValue } = eventDetail;
        onUpdatedFunction(property, oldValue, newValue);
    });
}
