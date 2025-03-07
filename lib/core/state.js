/**
 * @template { import('./route').Route } R
 * @template { R["name"] } RouteName
 * */

/**
 * @type { import("./suunta").Suunta<R> | undefined }
 * */
export let _suunta_router_instance_for_private_use = undefined;

/**
 *
 * @param { import("./suunta").Suunta<R> } routerInstance
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
    stackEntry.viewStates.push({
        state,
        connected: true,
    });

    return state;
}

/**
 * createGlobalState should be used with caution. For regular view state, use `createState` and if you
 * for some reason really want to create a GLOBAL reactive state object, only then use `createGlobalState`.
 *
 * `createGlobalState` works like `createState` but triggers an refresh on ALL views in the
 * viewstack on property changes. For applications that don't utilize Child Routes, this won't really act different
 * from the normal state objects, but for applications with Child Views implemented, this might affect performance.
 *
 * @param { T } initialState
 * @template { Record<string, unknown> } T
 * @returns { T }
 * */
export function createGlobalState(initialState) {
    if (!_suunta_router_instance_for_private_use) {
        return /** @type {T} */ ({});
    }

    const state = getStateProxy(initialState, _suunta_router_instance_for_private_use, true);

    return state;
}

/**
 * @param {Record<string, unknown>} stateObject
 * @param { import("./suunta").Suunta<R> } router
 * @param {import("./route").RenderStackEntry | true} stackEntry
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
 * @param { import("./suunta").Suunta<R> } router
 * @param {string[]} propPath
 * @param {import("./route").RenderStackEntry | true} stackEntry
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
 * @param { import("./suunta").Suunta<R> } router
 * @param {string[]} propPath
 * @param {import("./route").RenderStackEntry | true} stackEntry - stackEntry is `true` is setting up a globalstate
 */
function setupProxy(targetObject, router, propPath, stackEntry) {
    return new Proxy(targetObject, {
        apply(target, thisArg, argArray) {
            return Reflect.apply(target, thisArg, argArray);
        },
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

            const oldValue = Reflect.get(target, prop, receiver);
            const reflectResult = Reflect.set(target, prop, value);

            if (oldValue === value) {
                return reflectResult;
            }

            const eventPropPaths = [...propPath, prop.toString()];
            let propKey = '';
            while (eventPropPaths.length > 0) {
                if (propKey.length > 0) {
                    propKey += '.';
                }
                propKey = propKey + eventPropPaths.shift();
            }

            queueUpdate(stackEntry, propKey, oldValue, value, target, router);
            return reflectResult;
        },
    });
}

/**
 * @typedef StateOperationTarget
 * @property { UpdatedProperties } _updatedProperties
 * @property { boolean } _updateQueued
 * */

/**
 * @typedef {Map<string, { oldValue: any, newValue: any }> } UpdatedProperties
 * */

/**
 * @param {boolean | import("./route").RenderStackEntry} stackEntry
 * @param {string} propKey
 * @param {any} oldValue
 * @param {any} newValue
 * @param {StateOperationTarget} target
 * @param {import("./suunta").Suunta<R>} router
 */
function queueUpdate(stackEntry, propKey, oldValue, newValue, target, router) {
    if (!target._updatedProperties) {
        target._updatedProperties = new Map();
    }
    target._updatedProperties.set(propKey, { oldValue, newValue });

    if (!target._updateQueued) {
        target._updateQueued = true;
        queueMicrotask(async () => {
            await performUpdate(stackEntry, propKey, oldValue, newValue, target, router);
            target._updateQueued = false;
            target._updatedProperties = new Map();
        });
    }
}

/**
 * @param {boolean | import("./route").RenderStackEntry} stackEntry
 * @param {string} propKey
 * @param {any} oldValue
 * @param {unknown} newValue
 * @param {StateOperationTarget} target
 * @param {import("./suunta").Suunta<R>} router
 */
async function performUpdate(stackEntry, propKey, oldValue, newValue, target, router) {
    // If using global state, it's just "true"
    if (stackEntry === true) {
        router.getRenderStack().forEach(stackEntry => {
            router.triggerOnUpdated(stackEntry, target._updatedProperties);
        });
        await router.refreshAllViews();
    }

    // If doing a normal update
    if (typeof stackEntry !== 'boolean') {
        const connectedState = stackEntry.viewStates.find(state => state.connected);
        if (connectedState) {
            // Otherwise we are in a normal state object, and check if it's connected
            // and only update the view we updated the state on.
            router.triggerOnUpdated(stackEntry, target._updatedProperties);
            await router.refreshView(stackEntry);
        }
    }
}
