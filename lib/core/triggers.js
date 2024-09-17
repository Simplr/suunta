export const NAVIGATED_EVENT = "suunta-navigated";
export const UPDATED_EVENT = "suunta-updated";

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
    document.addEventListener(UPDATED_EVENT, (event) => {
        const eventDetail = /** @type { CustomEvent } */ (event).detail;
        const { property, oldValue, newValue } = eventDetail;
        onUpdatedFunction(property, oldValue, newValue);
    });
}
