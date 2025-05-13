import { getSuuntaInstance } from './state';

export const NAVIGATED_EVENT = 'suunta-navigated';
export const NAVIGATED_LEAVE_EVENT = 'suunta-navigated-leave';
export const UPDATED_EVENT = 'suunta-updated';
export const RENDER_EVENT = 'suunta-render';

/** @typedef {(updatedProperties: import('./state').UpdatedProperties) => any} OnUpdateFunction */

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
    const stackEntry = getSuuntaInstance()?.getRenderStack().at(-1);
    const eventName = stackEntry ? createNavigationLeaveEventName(stackEntry) : NAVIGATED_LEAVE_EVENT;
    document.addEventListener(eventName, onNavigationLeaveFunction, { once: true });
}

/**
 * @param { EventListenerOrEventListenerObject } onRenderFunction
 */
export function onRender(onRenderFunction) {
    document.addEventListener(RENDER_EVENT, onRenderFunction);

    return () => {
        document.removeEventListener(RENDER_EVENT, onRenderFunction);
    };
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
    if (!getSuuntaInstance()) {
        console.warn('[Suunta]: Calling onUpdated before initializing router.');
        return;
    }
    const stackEntry = getSuuntaInstance().getRenderStack().at(-1);
    if (!stackEntry) {
        console.warn('[Suunta]: Calling onUpdated outside of a view.');
        return;
    }

    stackEntry.eventTarget.addEventListener(UPDATED_EVENT, (/** @type {CustomEvent<any>} */ event) => {
        const eventDetail = /** @type { CustomEvent } */ (event).detail;
        onUpdatedFunction(eventDetail);
    });
}
