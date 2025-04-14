# Suunta - Fetch

The Fetch library of Suunta is designed to provide a stateful and declarative way to 
manage API requests and their lifecycle.

### Requests

Most of modern web applications tend to handle some kind of API calls to an external service.

When managing async connections to external services, you need to manage multiple states. 
There's loading, errors, data etc.

Suunta Fetch provides request state management that works with the Suunta Core state system.

```typescript
import { html } from "lit";
import { fetchPending, pendingApiResponse } from "suunta/fetch";

export function View() {
  const request = pendingApiResponse(
    fetchPending<GetAllCustomerInfoResponse>("http://localhost:8080/customers"),
  );

    return () => html`
        <h2>Users</h2>

        ${request.loading
          ? html`<p>Loading...</p>`
          : html`
              <ul>
                ${request.result.customers.map(
                  (c) => html` <li>${c.firstName} ${c.lastName}</li> `,
                )}
              </ul>
        `}
    `;
}
```

The `pendingApiResponse` function works out of the box with [Hey API](https://heyapi.dev/) generated SDK's.

```typescript
import { getAllCustomerInfo } from "../hey-api/sdk.gen";

const request = pendingApiResponse(getAllCustomerInfo);
```

There is also a out-of-the-box implementation with Suunta named `fetchPending`, which only wraps the fetch API 
and provides some simple utilities to it.

Some people however might want some more granular control over their process and want to write their own fetch wrappers.
That is also supported and encouraged by Suunta! A good starting point would be something along the lines of:

```typescript
import { RequestResult } from "suunta/fetch/core";

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

    const data = await response.json() as T;

    return {
      response,
      request,
      error: undefined,
      data,
    };
  };
}
```

