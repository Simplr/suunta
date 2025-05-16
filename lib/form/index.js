import { createState } from '../core/state';

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
export function createForm({
    id,
    parent = document.body,
    events = [],
    onSubmit,
    onFormData,
    onErrorsUpdated,
    validator,
}) {
    const formState = createState({
        data: /** @type { T } */ ({}),
        /** @type { Set<string> } */
        visitedFields: new Set(),
        /** @type { HTMLFormElement | undefined } */
        form: undefined,
        /** @type { Partial<Record<keyof T, Element>> } */
        fieldsWithErrors: {},
        /** @type { Partial<Record<keyof T, string>> } */
        errors: {},
    });

    /** @type { Map<string, ((e: Event) => any)[]> } */
    const listeners = new Map();
    const eventsToListen = [...events, 'change', 'input', 'blur'];

    /**
     * @param {number} [iteration]
     */
    async function tryGetForm(iteration = 0) {
        const form = parent.querySelector(`#${id}`);
        if (!form && iteration < 50) {
            // TODO: Could this be less ham-fisted?
            await new Promise(resolve => setTimeout(resolve, 100));
            return tryGetForm(iteration + 1);
        }
        return form;
    }

    async function onConnected() {
        const form = await tryGetForm();
        if (form && form instanceof HTMLFormElement) {
            formState.form = form;
            setEventListeners(form);
            refreshFormData(form);
        } else {
            console.error('[Suunta/form]: Form could not be found. Tried searching from ', parent);
        }
    }

    // Try to load the form
    onConnected();

    /**
     * @param {HTMLFormElement} form
     */
    function setEventListeners(form) {
        eventsToListen.forEach(eventName => {
            form.addEventListener(eventName, e => onFormEvent(form, e, eventName));
        });

        form.addEventListener('submit', e => {
            e.preventDefault();

            refreshFormData(form);
            // On submit, we make all fields visited so that all errors are shown
            formState.visitedFields = new Set(Object.keys(formState.data));
            validate();

            const errors = cleanProxyFields(formState.errors);
            const hasErrors = Object.keys(errors).length > 0;
            onSubmit?.(e, hasErrors);
        });

        const observer = new MutationObserver(() => {
            refreshFormData(form);
        });

        observer.observe(form, {
            childList: true,
            subtree: true,
        });
    }

    /**
     * @param {HTMLFormElement} form
     * @param {Event} e
     * @param {string} eventName
     */
    function onFormEvent(form, e, eventName) {
        if (eventName.includes('blur') || eventName.includes('change')) {
            const element = e.target;
            if (element instanceof Element) {
                setVisited(element.getAttribute('name'));
            }
        }

        refreshFormData(form);
        validate();

        // Handle event listeners
        const listenersForEvent = listeners.get(eventName);
        if (listenersForEvent) {
            listenersForEvent.forEach(l => l(e));
        }
    }

    function validate() {
        if (validator) {
            const validationResult = validator(formState.data);
            reportErrors(validationResult.error?.errors);
        }
    }

    /**
     * @param {string | null} fieldName
     */
    function setVisited(fieldName) {
        if (!fieldName) {
            return;
        }
        formState.visitedFields.add(fieldName);
    }

    /**
     * @param {HTMLFormElement} form
     */
    function refreshFormData(form) {
        // Set form data to state object to expose it
        const formDataJson = formDataToJson(form);

        // Assing new states
        formState.data = /** @type { T } */ (formDataJson);

        onFormData?.(formState.data);
    }

    /**
     * @param {string | string[]} eventName
     * @param {(event: Event) => any | (() => any)} callback
     *
     * Listen for events triggered by your form
     *
     * @example
     *
     * ```typescript
     * const form = createForm({});
     *
     * form.on("input", (ev) => {
     *      console.log("Value changed");
     * })
     * ```
     */
    function on(eventName, callback) {
        const events = Array.isArray(eventName) ? eventName : [eventName];

        for (const eventName of events) {
            if (!listeners.has(eventName)) {
                listeners.set(eventName, []);
            }
            listeners.get(eventName)?.push(callback);
        }
    }

    /**
     * @param { import('./form').FormError[] } errors
     * */
    function reportErrors(errors = []) {
        const errorsByField = errors.reduce(
            (/** @type { Record<string, import('./form').FormError[]> } */ acc, err) => {
                const path = err.path.join('.');
                if (!acc[path]) {
                    acc[path] = [];
                }
                acc[path].push(err);
                return acc;
            },
            {},
        );

        for (const errorsForField of Object.values(errorsByField)) {
            const error = errorsForField[0];
            /** @type { keyof T } */
            const key = error.path.join('.');
            if (formState.visitedFields.has(key)) {
                const input = formState.form?.querySelector(`[name=${key.toString()}]`);
                if (input) {
                    if (hasFormControls(input)) {
                        input.setCustomValidity(error.message);
                    }

                    formState.fieldsWithErrors[key] = input;
                    formState.errors[key] = error.message;
                }
            }
        }

        const errorPaths = new Set(Object.keys(errorsByField));

        /** @type { Partial<Record<keyof T, Element>> } */
        const removedErrors = {};

        Object.entries(formState.fieldsWithErrors).forEach(([key, val]) => {
            if (!errorPaths.has(key) && hasFormControls(val)) {
                val.setCustomValidity('');
                val.reportValidity();

                // This is just to type guard so TS is happy
                /** @type { keyof T } */
                const fieldKey = key;

                removedErrors[fieldKey] = formState.fieldsWithErrors[fieldKey];
                delete formState.fieldsWithErrors[fieldKey];
                delete formState.errors[fieldKey];
            }
        });

        onErrorsUpdated?.(
            cleanProxyFields(formState.errors),
            cleanProxyFields(formState.fieldsWithErrors),
            cleanProxyFields(removedErrors),
        );
    }

    /**
     * @template { Partial<Record<keyof T, any>> } T
     * @param { T } object
     * @returns { T }
     */
    function cleanProxyFields(object) {
        if (!object) {
            return object;
        }
        const { _updatedProperties, _updateQueued, ...rest } = object;
        return /** @type { T } */ (rest);
    }

    return {
        on,
        get elem() {
            return formState.form;
        },
        get data() {
            return formState.data;
        },
        get errors() {
            return cleanProxyFields(formState.errors);
        },
        get ok() {
            return Object.keys(this.errors || {}).length === 0;
        },
        reportErrors,
    };
}

/**
 * @param { Element | undefined } field
 * @returns { field is Element & { setCustomValidity: (error: string) => void, reportValidity: () => boolean }}
 * */
function hasFormControls(field) {
    if (!field || !(field instanceof Element)) {
        return false;
    }

    return (
        'setCustomValidity' in field &&
        typeof field.setCustomValidity === 'function' &&
        'reportValidity' in field &&
        typeof field.reportValidity === 'function'
    );
}

/**
 * @param { FormDataEntryValue } value
 * */
function transformFormValue(value) {
    switch (value) {
        case 'true':
            return true;
        case 'false':
            return false;
        case 'on':
            return true;
        default:
            return value;
    }
}

/**
 * @param {HTMLFormElement} form
 * @returns { Record<string, unknown> }
 */
export function formDataToJson(form) {
    const formDataJson = new FormData(form)
        .entries()
        .reduce((/** @type { Record<string, unknown> } */ acc, [key, value]) => {
            const transformedValue = transformFormValue(value);
            // If value has not been set, set it normally
            // If it has the array brackets, we proceed to lower levels
            if (!Reflect.has(acc, key) && !key.includes('[')) {
                acc[key] = transformedValue;
                return acc;
            }
            // If we get here, we want to initialize an array.
            if (!Array.isArray(acc[key])) {
                acc[key] = [];
            }
            // ... and then push the item to the array.
            if (Array.isArray(acc[key])) {
                acc[key].push(transformedValue);
            }
            return acc;
        }, {});

    // If we have any array-items, like users[name]
    // The output of this will return { users: [ { name: 'foo' }, { name: 'bar' }] }
    if (Object.values(formDataJson).some(val => Array.isArray(val))) {
        const formDataArrayEntries = /** @type { [string, any[]][] } */ (
            [...Object.entries(formDataJson)].filter(([key, val]) => Array.isArray(val))
        );

        for (const dataEntry of formDataArrayEntries) {
            // Match the field name
            const submitName = dataEntry[0];
            // Match the collection of values
            const entryValues = dataEntry[1];

            // Get the start so users[name] => users
            const objectName = submitName.substring(0, submitName.indexOf('['));
            // Get the prop name so users[name] => name
            const fieldName = submitName.replaceAll(/.*\[|\]/g, '');
            if (!fieldName || fieldName.trim().length === 0) {
                formDataJson[objectName] = entryValues;
            } else {
                let objectArray = /** @type { Record<string, unknown>[] } */ (formDataJson[objectName]);
                if (!objectArray) {
                    objectArray = [];
                }
                for (let i = 0; i < entryValues.length; i++) {
                    if (!objectArray[i]) {
                        objectArray[i] = {};
                    }
                    objectArray[i][fieldName] = entryValues[i];
                }

                formDataJson[objectName] = objectArray;
            }

            delete formDataJson[submitName];
        }
    }

    return formDataJson;
}
