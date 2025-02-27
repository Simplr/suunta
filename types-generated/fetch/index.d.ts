/**
 * Creates a function that performs a fetch request and returns a promise resolving to a RequestResult.
 * This is mostly used as an example approach to using the pendingApiResponse call.
 *
 * @template T
 * @param {RequestInfo | URL} input - The URL or request info.
 * @param {RequestInit} [init] - Optional fetch initialization options.
 * @returns {() => Promise<import("./fetch").RequestResult<T>>} - A function that performs the fetch request.
 */
export function fetchPending<T>(input: RequestInfo | URL, init?: RequestInit | undefined): () => Promise<import("./fetch").RequestResult<T>>;
/**
 * Handles an API response and provides reactive state management.
 *
 * @template T
 * @param {() => Promise<import("./fetch").RequestResult<T>>} apiCallFunction - A function that performs an API request.
 * @returns {import("./fetch").ApiResponse<T>} - An object containing the request state.
 */
export function pendingApiResponse<T>(apiCallFunction: () => Promise<import("./fetch").RequestResult<T>>): import("./fetch").ApiResponse<T>;
