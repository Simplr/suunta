import { router } from './state';

export const NAVIGATED_EVENT = 'suunta-navigated';
export const UPDATED_EVENT = 'suunta-updated';

/** @typedef {(property: string, oldValue: unknown, newValue: unknown) => any} OnUpdateFunction */

/**
 * @param { EventListenerOrEventListenerObject } onNavigationFunction
 */
export function onNavigation(onNavigationFunction) {
    document.addEventListener(NAVIGATED_EVENT, onNavigationFunction, { once: true });
}

/**
 * @param { OnUpdateFunction } onUpdatedFunction
 */
export function onUpdated(onUpdatedFunction) {
    if (!router) {
        console.warn('[Suunta]: Calling onUpdated before initializing router.');
        return;
    }
    const stackEntry = router.getRenderStack().at(-1);
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
