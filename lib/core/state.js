/** @type { import("./suunta").Suunta | undefined } */
export let _suunta_router_instance_for_private_use = undefined;

/**
 * @param { import("./suunta").Suunta } routerInstance
 * */
export function initializeRouterForStateOperations(routerInstance) {
    _suunta_router_instance_for_private_use = routerInstance;
}

/**
 * @param { T } initialState
 * @template { Record<string, unknown> } T
 * @returns { T }
 * */
export function createState(initialState) {
    if (!_suunta_router_instance_for_private_use) {
        return /** @type {T} */ ({});
    }

    // We need to store the stackEntry so that we know to render the correct view
    const stackEntry = _suunta_router_instance_for_private_use.getRenderStack().at(-1);
    if (!stackEntry) {
        return /** @type {T} */ ({});
    }

    const state = getStateProxy(initialState, _suunta_router_instance_for_private_use, stackEntry);
    stackEntry.viewState = {
        state,
        connected: true,
    };

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
 * @param {any} value
 *
 * @returns { value is (Object | []) }
 */
function isObjectOrArray(value) {
    return value instanceof Object || value instanceof Array;
}

/**
 * @param {any} targetObject
 * @param {import("./suunta").Suunta} router
 * @param {string[]} propPath
 * @param {import("./route").RenderStackEntry} stackEntry
 */
function setupNestedProxy(targetObject, router, propPath, stackEntry) {
    [...Object.entries(targetObject)]
        .filter(([key, value]) => isObjectOrArray(value))
        .forEach(entry => {
            const key = entry[0];
            const value = entry[1];
            const newPropPath = [...propPath, key];

            targetObject[key] = setupProxy(value, router, newPropPath, stackEntry);
            setupNestedProxy(targetObject[key], router, newPropPath, stackEntry);
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
            if (prop === 'isSuuntaProxy') {
                return true;
            }
            return Reflect.get(target, prop, receiver);
        },

        /**
         * @param {any} target
         * @param {string} prop
         * @param {unknown} value
         */
        set(target, prop, value, receiver) {
            // @ts-ignore
            if (isObjectOrArray(value) && !value.isSuuntaProxy) {
                value = setupProxy(value, router, propPath, stackEntry);
            }

            const oldValue = target[prop];
            const reflectResult = Reflect.set(target, prop, value);

            const eventPropPaths = [...propPath, prop.toString()];
            let propKey = '';
            while (eventPropPaths.length > 0) {
                if (propKey.length > 0) {
                    propKey += '.';
                }
                propKey = propKey + eventPropPaths.shift();
            }

            if (stackEntry.viewState?.connected) {
                router.triggerOnUpdated(stackEntry, propKey, oldValue, value);
                router.refreshView(stackEntry);
            }
            return reflectResult;
        },
    });
}
