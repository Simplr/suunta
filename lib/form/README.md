# Suunta - Form

The Form library of Suunta is designed to provide a painless way to interact with
your forms in real-time. 

The Form library provides easy hooks to react to changes in the form, extracting any data
from the form and even validating the form in real-time with [Zod](https://zod.dev/).

## Example

```typescript
import { html } from 'lit-html';
import { when } from 'lit/directives/when.js';
import { router } from '../router';
import { createForm } from 'suunta/form';
import { z } from 'zod';

const ValidationSchema = z.object({
    name: z
        .string() //
        .min(3, 'At least 3 letters are required')
        .max(10, 'Slow down, cowboy'),
});

type FormSchema = z.infer<typeof ValidationSchema>;

export function FormView() {
    const form = createForm<FormSchema>({
        id: 'example-form',
        validator: ValidationSchema.safeParse,

        onSubmit: (ev, hasErrors) => {
            if (hasErrors) {
                console.log('Has errors', form.errors);
            } else {
                console.log('No errors');
            }
        },
    });

    return () => {
        return html`
            <form id="example-form" class="flex flex-col gap-4">
                <label class="flex flex-col">
                    What is your name?
                    <input class="border-1" type="text" name="name" placeholder="Matsuuu" />
                    ${when(form.errors.name, () => html`
                        <span class="text-red-500">${form.errors.name}</span>
                    `)}
                </label>

                <button class="border-2 px-2 py-1" type="submit">Submit</button>
            </form>
        `;
    };
}
```


### Integration with a component system

Many times your component system might have inputs with an attribute for error messages.
Suunta Form takes these into account and provides an easy API for manage errors yourself.

```typescript
import { html } from 'lit-html';
import { when } from 'lit/directives/when.js';
import { router } from '../router';
import { createForm } from 'suunta/form';
import { z } from 'zod';

const ValidationSchema = z.object({
    name: z
        .string() //
        .min(3, 'At least 3 letters are required')
        .max(10, 'Slow down, cowboy'),
});

type FormSchema = z.infer<typeof ValidationSchema>;

export function FormView() {
    const form = createForm<FormSchema>({
        id: 'example-form',
        validator: ValidationSchema.safeParse,
        // Listen to extra events launched by your component system
        events: ['sl-blur', 'sl-change'],

        onSubmit: (ev, hasErrors) => {
            if (hasErrors) {
                console.log('Has errors', form.errors);
            } else {
                console.log('No errors');
            }
        },

        // Manually handle error states for your components
        onErrorsUpdated: (errors, errorFields, removedErrors) => {
            Object.entries(errorFields).forEach(([key, field]) => {
                field.setAttribute('help-text', errors[key]);
            });
            Object.entries(removedErrors).forEach(([key, field]) => {
                field.setAttribute('help-text', '');
            });
        },
    });

    return () => {
        return html`
            <form id="example-form" class="flex flex-col gap-4">
                <sl-input label="Name" name="name"></sl-input>

                <button class="border-2 px-2 py-1" type="submit">Submit</button>
            </form>
        `;
    };
}
```

### Parsing form data without createForm hook

Sometimes you just want to get data from a form as a JSON payload without any extra 
lifecycle events. For those needs, the Suunta Form library provides a helper function.

```typescript
import { formDataToJson } from "suunta/form";

const form = document.querySelector("form");
const payload = formDataToJson(form);
```

## Giving forms superpowers

Native forms might feel a bit limited for features like array values. Suunta Form
parses form fields with some extra features, enabled by just naming your fields in a supported schema.

```typescript

```
