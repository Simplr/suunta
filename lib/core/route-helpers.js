/**
 * @param { import("./route").Route } route
 * @returns { route is import("./route").ViewRoute }
 */
export function isViewRoute(route) {
    return route.hasOwnProperty('view');
}

/**
 * @param { import("./route").Route } [route]
 * @returns { route is import("./route").ChildViewRoute }
 */
export function isChildRoute(route) {
    if (!route) return false;
    return (
        route.hasOwnProperty('isChild') && /** @type { import("./route").ChildViewRoute } */ (route).isChild === true
    );
}

/**
 * @param { import("./route").Route } route
 * @returns { route is import("./route").RedirectRoute }
 */
export function isRedirectRoute(route) {
    return route.hasOwnProperty('redirect');
}

/**
 * @param { string } first
 * @param { string } second
 * @returns { string }
 */
export function combinePaths(first, second) {
    const firstNeedsDelimiter = !first.endsWith('/');
    const secondNeedsDelimiter = !second.startsWith('/');
    if (firstNeedsDelimiter && secondNeedsDelimiter) {
        return `${first}/${second}`;
    }
    if (!firstNeedsDelimiter && !secondNeedsDelimiter) {
        return first + second.substring(1);
    }

    return first + second;
}

/**
 * Ugly type hack until I come up with something better to type it
 * @param { unknown } something
 * @returns { something is import("./route").ImportedView }
 */
export function isModule(something) {
    return Object.prototype.toString.call(something) === '[object Module]';
}

/**
 * @param { import("./route").RouteView | import("./route").ImportedView } view
 * @returns { view is import("./route").RenderableView }
 */
export function isRenderableView(view) {
    return typeof view !== 'function' && !isModule(view);
}

/**
 * Lmao we could make this declaration less ugly
 * @param { import("./route").RouteView | import("./route").ImportedView } view
 * @returns { view is import("./route").Lazy<import("./route").RenderableView> | import("./route").LazyImportedRouteView }
 */
export function isFunction(view) {
    return typeof view === 'function';
}
/**
 * @returns { Promise<void> }
 */
export function waitFrame(count = 1) {
    return new Promise(async resolve => {
        for (let i = 0; i < count; i++) {
            await new Promise(r => window.requestAnimationFrame(r));
        }
        resolve();
    });
}
