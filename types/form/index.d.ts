/**
 * @template { Record<string, unknown> } T
 *
 * @param {import('./form').CreateFormOptions<T>} options
 *
 *
 * @example
 *
 * ```typescript
 *
 *  function onSubmit(e: SubmitEvent) {
 *      console.log(form.data);
 *   }
 *
 * function onFormData(formData: ExampleForm) {
 *   const result = ExampleFormSchema.safeParse(formData);
 *      if (result.error) {
 *           form.reportErrors(result.error.errors);
 *       }
 *   }
 *
 *   const form = createForm<PreliminaryForm>({
 *       id: "preliminary-info-form",
 *       events: ["sl-change"],
 *       onSubmit,
 *       onFormData,
 *   });
 * ```
 * */
export function createForm<T extends Record<string, unknown>>({ id, parent, events, onSubmit, onFormData, onErrorsUpdated, validator, }: import("./form").CreateFormOptions<T>): {
    on: (eventName: string | string[], callback: (event: Event) => any | (() => any)) => void;
    refresh: () => void;
    readonly elem: HTMLFormElement | undefined;
    readonly data: T;
    readonly errors: Partial<Record<keyof T, string>>;
    readonly ok: boolean;
    reportErrors: (errors?: import("./form").FormError[]) => void;
};
/**
 * @param {HTMLFormElement} form
 * @returns { Record<string, unknown> }
 */
export function formDataToJson(form: HTMLFormElement): Record<string, unknown>;
