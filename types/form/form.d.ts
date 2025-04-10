export interface CreateFormOptions<T> {
    /**
     * The ID of the form to target
     * */
    id: string;
    /**
     * Parent element to target querySelectors from. Helpful for when you have forms inside shadow roots
     *
     * @default document.body
     * */
    parent?: Element | Document | ShadowRoot;
    /**
     * List of events you want to listen on top of the default events.
     * Default events are: ["input", "change"]
     *
     * Submit event does is handled separately from these events and
     * the event is accessed through the `onSubmit` option.
     * */
    events?: string[];
    onSubmit?: (event: SubmitEvent, hasErrors: boolean) => any;
    /**
     * Triggered when form data is updated.
     * */
    onFormData?: (formData: T) => any;
    onErrorsUpdated?: (errors: Partial<Record<keyof T, string>>, errorFields: Partial<Record<keyof T, Element>>, removedErrors: Partial<Record<keyof T, Element>>) => any;
    validator?: (formData: T) => ValidationResult;
}
export interface SuuntaForm<T> {
    on: (eventName: string | string[], callback: (event: Event) => any | (() => any)) => void;
    elem: Element | undefined;
    readonly data: T;
    readonly errors: Partial<Record<keyof T, string>>;
    reportErrors: (errors?: import('./form').FormError[]) => void;
}
interface ValidationResult {
    error?: ValidationError;
}
interface ValidationError {
    errors?: FormError[];
}
export interface FormError {
    message: string;
    path: (string | number)[];
}
export type KeyOf<T extends Record<string, unknown>> = keyof T;
export {};
