export type ApiResponse<T> = {
    reload: () => void;
} & ( // Failed, has error, not loading, no success
    | { failed: true; loading: false; success: false; error: string; result: undefined }
    // Did not fail, still loading, no success, no error
    | { failed: false; loading: true; success: false; error: undefined; result: undefined }
    // Did not fail, finished loading, success true, no error, has result
    | { failed: false; loading: false; success: true; error: undefined; result: T }
);

export type RequestResult<T> = (
    | {
          data: T;
          error: undefined;
      }
    | {
          data: undefined;
          error: unknown;
      }
) & {
    request: Request;
    response: Response;
};

export type PendingApiResponseOptions<T> = {
    onSuccess?: (result: T) => any;
    onError?: (error: string) => any;
};
