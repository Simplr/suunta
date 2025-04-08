export interface CreateFormOptions<T> {
    /**
     * The ID of the form to target
     * */
    id: string;
    /**
     * List of events you want to listen on top of the default events.
     * Default events are: ["input", "change"]
     *
     * Submit event does is handled separately from these events and
     * the event is accessed through the `onSubmit` option.
     * */
    events?: string[];

    onSubmit?: (event: SubmitEvent) => any;

    /**
     * Triggered when form data is updated.
     * */
    onFormData?: (formData: T) => any;
}

export interface FormError {
    message: string;
    path: (string | number)[];
}
