export type ApiResponse<T> = {
    reload: () => void;
} & ({
    failed: true;
    loading: false;
    success: false;
    error: string;
    result: undefined;
} | {
    failed: false;
    loading: true;
    success: false;
    error: undefined;
    result: undefined;
} | {
    failed: false;
    loading: false;
    success: true;
    error: undefined;
    result: T;
});
export type RequestResult<T> = ({
    data: T;
    error: undefined;
} | {
    data: undefined;
    error: unknown;
}) & {
    request: Request;
    response: Response;
};
export type PendingApiResponseOptions<T> = {
    onSuccess?: (result: T) => any;
    onError?: (error: string) => any;
};
