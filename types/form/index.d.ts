/**
 * @template { Record<string, unknown> } T
 *
 * @param {import('./form').CreateFormOptions<T>} options
 * */
export function createForm<T extends Record<string, unknown>>({ id, events, onSubmit, onFormData }: import("./form").CreateFormOptions<T>): {
    on: (eventName: string | string[], callback: (event: Event) => any | (() => any)) => void;
    readonly data: T;
    readonly errors: Map<string, string>;
    reportErrors: (errors: import("./form").FormError[]) => void;
};
/**
 * @param {HTMLFormElement} form
 * @returns { Record<string, unknown> }
 */
export function formDataToJson(form: HTMLFormElement): Record<string, unknown>;
