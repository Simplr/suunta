import { createState } from '../core/state.js';

/**
 * Creates a function that performs a fetch request and returns a promise resolving to a RequestResult.
 * This is mostly used as an example approach to using the pendingApiResponse call.
 *
 * @template T
 * @param {RequestInfo | URL} input - The URL or request info.
 * @param {RequestInit} [init] - Optional fetch initialization options.
 * @returns {() => Promise<import("./fetch.js").RequestResult<T>>} - A function that performs the fetch request.
 */
export function fetchPending(input, init) {
    return async function () {
        const request = new Request(input, init);
        const response = await fetch(request);

        if (!response.ok) {
            const error = await response.text();
            return {
                response,
                request,
                error,
                data: undefined,
            };
        }

        const data = /** @type { T } */ (await response.json());

        return {
            response,
            request,
            error: undefined,
            data,
        };
    };
}

/**
 * Handles an API response and provides reactive state management.
 *
 * @template T
 * @param {() => Promise<import("./fetch.js").RequestResult<T>>} apiCallFunction - A function that performs an API request.
 * @param { import('./fetch.js').PendingApiResponseOptions<T> } [options]
 * @returns {import("./fetch.js").ApiResponse<T>} - An object containing the request state.
 */
export function pendingApiResponse(apiCallFunction, { onSuccess, onError } = {}) {
    async function executeApiCall() {
        const res = await apiCallFunction();

        if (res.error) {
            resultObject.failed = true;
            resultObject.error = res.error.toString();
            resultObject.success = false;
            onError?.(res.error.toString());
        } else {
            resultObject.result = res.data;
            resultObject.success = true;
            onSuccess?.(/** @type { T } */ (res.data));
        }
        resultObject.loading = false;
    }

    function reload() {
        Object.assign(resultObject, {
            error: undefined,
            loading: true,
            failed: false,
            success: false,
            result: undefined,
        });
        executeApiCall();
    }

    /**
     * @type { import("./fetch.js").ApiResponse<T> }
     * */
    const resultObject = createState({
        error: undefined,
        loading: true,
        failed: false,
        success: false,
        result: undefined,
        reload,
    });

    executeApiCall();

    return resultObject;
}
