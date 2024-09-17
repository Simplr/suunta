/** @type { import("./suunta").Suunta | undefined } */
export let router = undefined;

/**
 * @param { import("./suunta").Suunta } routerInstance
 * */
export function initializeRouterForStateOperations(routerInstance) {
    router = routerInstance;
}

/**
 * @param { T } initialState
 * @template { Record<string, unknown> } T
 * @returns { T }
 * */
export function createState(initialState) {
    if (!router) {
        return /** @type {T} */ ({});
    }

    // We need to store the stackEntry so that we know to render the correct view
    const stackEntry = router.getRenderStack().at(-1);
    if (!stackEntry) {
        return /** @type {T} */ ({});
    }

    const state = getStateProxy(initialState, router, stackEntry);
    return state;
}

/**
 * @param {Record<string, unknown>} stateObject
 * @param {import("./suunta").Suunta} router
 * @param {import("./route").RenderStackEntry} stackEntry
 */
export function getStateProxy(stateObject, router, stackEntry) {
    /** @type { string[] } */
    const propPath = [];
    const mainProxy = setupProxy(stateObject, router, propPath, stackEntry);

    setupNestedProxy(stateObject, router, propPath, stackEntry);

    return mainProxy;
}

/**
 * @param {Object} targetObject
 * @param {import("./suunta").Suunta} router
 * @param {string[]} propPath
 * @param {import("./route").RenderStackEntry} stackEntry
 */
function setupNestedProxy(targetObject, router, propPath, stackEntry) {
    [...Object.entries(targetObject)]
        .filter(([key, value]) => value instanceof Object)
        .forEach(entry => {
            const key = entry[0];
            const value = entry[1];
            const newPropPath = [...propPath, key];
            // @ts-ignore
            targetObject[key] = setupProxy(value, router, newPropPath, stackEntry);
            setupNestedProxy(value, router, newPropPath, stackEntry);
        });
}

/**
 * @param {any} targetObject
 * @param {import("./suunta").Suunta} router
 * @param {string[]} propPath
 * @param {import("./route").RenderStackEntry} stackEntry
 */
function setupProxy(targetObject, router, propPath, stackEntry) {
    return new Proxy(targetObject, {
        /**
         * @param {any} target
         * @param {any} prop
         * @param {unknown} receiver
         */
        get(target, prop, receiver) {
            return Reflect.get(target, prop, receiver);
        },

        /**
         * @param {any} obj
         * @param {string} prop
         * @param {unknown} value
         */
        set(obj, prop, value) {
            // TODO: If array value was added, and is an object, we need
            // to add a Proxy for that value also.
            // Also for new keys etc.
            const oldValue = Reflect.get(obj, prop);
            const reflectResult = Reflect.set(obj, prop, value);

            const eventPropPaths = [...propPath, prop.toString()];
            let propKey = '';
            while (eventPropPaths.length > 0) {
                if (propKey.length > 0) {
                    propKey += '.';
                }
                propKey = propKey + eventPropPaths.shift();
            }

            router.triggerOnUpdated(stackEntry, propKey, oldValue, value);
            router.refreshView(stackEntry);
            return reflectResult;
        },
    });
}
