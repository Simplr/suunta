import { createState } from '../core/state';
import { onRender } from '../core/triggers';

/**
 * @template { Record<string, unknown> } T
 *
 * @param {import('./form').CreateFormOptions<T>} options
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
export function createForm({ id, events = [], onSubmit, onFormData }) {
    const formState = createState({
        data: /** @type { T } */ ({}),
        /** @type { Set<string> } */
        visitedFields: new Set(),
        /** @type { HTMLFormElement | undefined } */
        form: undefined,
        /** @type { Map<string, Element> } */
        fieldsWithErrors: new Map(),
        /** @type { Map<string, string> } */
        errors: new Map(),
    });

    /** @type { Map<string, ((e: Event) => any)[]> } */
    const listeners = new Map();
    const eventsToListen = [...events, 'change', 'input'];

    const unsubscribeFromOnRender = onRender(() => {
        const form = document.querySelector(`#${id}`);
        if (form && form instanceof HTMLFormElement) {
            formState.form = form;
            clearInterval(interval);
            setEventListeners(form);
        }
        unsubscribeFromOnRender();
    });
    const interval = setInterval(() => {}, 100);

    /**
     * @param {HTMLFormElement} form
     */
    function setEventListeners(form) {
        eventsToListen.forEach(eventName => {
            form.addEventListener(eventName, e => onInputOrChange(form, e, eventName));
        });

        form.addEventListener('submit', e => {
            e.preventDefault();
            // On submit, we make all fields visited so that all errors are shown
            formState.visitedFields = new Set(Object.keys(formState.data));
            onSubmit?.(e);
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
    function onInputOrChange(form, e, eventName) {
        refreshFormData(form);
        // Handle event listeners
        const listenersForEvent = listeners.get(eventName);
        if (listenersForEvent) {
            listenersForEvent.forEach(l => l(e));
        }
    }

    /**
     * @param {HTMLFormElement} form
     */
    function refreshFormData(form) {
        // Set form data to state object to expose it
        const formDataJson = formDataToJson(form);

        // Set visited fields to track dirtyness
        Object.entries(formDataJson).forEach(([key, val]) => {
            if (val) {
                formState.visitedFields.add(key);
            }
        });

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
    function reportErrors(errors, reportAll = false) {
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
            const key = error.path.join('.');
            if (formState.visitedFields.has(key)) {
                const input = formState.form?.querySelector(`[name=${key}]`);
                if (input) {
                    if (hasFormControls(input)) {
                        input.setCustomValidity(error.message);
                    }

                    formState.fieldsWithErrors.set(key, input);
                    formState.errors.set(key, error.message);
                }
            }
        }

        const errorPaths = new Set(Object.keys(errorsByField));

        formState.fieldsWithErrors.entries().forEach(([key, val]) => {
            if (!errorPaths.has(key) && hasFormControls(val)) {
                val.setCustomValidity('');
                val.reportValidity();
                formState.errors.delete(key);
            }
        });
    }

    return {
        on,
        get data() {
            return formState.data;
        },
        get errors() {
            return formState.errors;
        },
        reportErrors,
    };
}

/**
 * @param { Element } field
 * @returns { field is Element & { setCustomValidity: (error: string) => void, reportValidity: () => boolean }}
 * */
function hasFormControls(field) {
    if (!field) {
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
    if (Object.values(formDataJson).some(val => Array.isArray(val))) {
        // The output of this will return { users: [ { name: 'foo' }, { name: 'bar' }] }
        const formDataArrayEntries = [...Object.entries(formDataJson)].filter(([key, val]) => Array.isArray(val));
        const submitName = formDataArrayEntries[0][0];
        const objectName = submitName.substring(0, submitName.indexOf('['));
        /** @type { Record<string, unknown[]>[] } */
        const items = [];
        for (let i = 0; i < formDataArrayEntries.length; i++) {
            const entry = formDataArrayEntries[i];
            const entryName = entry[0].replaceAll(/.*\[|\]/g, '');
            const entryValues = entry[1];
            if (Array.isArray(entryValues)) {
                for (let j = 0; j < entryValues.length; j++) {
                    if (!items[j]) {
                        items[j] = {};
                    }
                    items[j][entryName] = entryValues[j];
                }
            }
            delete formDataJson[entry[0]];
        }

        formDataJson[objectName] = items;
    }

    return formDataJson;
}
