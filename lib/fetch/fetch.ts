export type ApiResponse<T> = {
    loading: boolean;
    reload: () => void;
} & ({ failed: true; error: string; result: undefined } | { failed: false; error: undefined; result: T });

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
