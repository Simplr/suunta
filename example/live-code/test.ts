import { RequestResult } from 'suunta/fetch';

export function fetchPending<T>(input: RequestInfo | URL, init?: RequestInit): () => Promise<RequestResult<T>> {
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

        const data = /** @type { T } */ await response.json();

        return {
            response,
            request,
            error: undefined,
            data,
        };
    };
}
