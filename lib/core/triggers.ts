export const NAVIGATED_EVENT = "suunta-navigated";

export function onNavigation(onNavigationFunction: EventListenerOrEventListenerObject) {
    document.addEventListener(NAVIGATED_EVENT, onNavigationFunction, { once: true });
}