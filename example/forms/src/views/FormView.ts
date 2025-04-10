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
    otherName: z
        .string() //
        .min(3, 'At least 3 letters are required')
        .max(10, 'Slow down, cowboy'),
});

type FormSchema = z.infer<typeof ValidationSchema>;

export function FormView() {
    // TODO: Implement "parent" so that you can point to where the form might be
    const form = createForm<FormSchema>({
        id: 'example-form',
        validator: ValidationSchema.safeParse,
        events: ['sl-blur', 'sl-change'],
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
        console.log(form.errors);
        return html`
            <div class="flex flex-col items-center justify-center h-full w-full gap-4">
                <h2 class="text-4xl">FormView</h2>
                <a class="underline" href="${router.resolve('HomeView')}">Back</a>

                <form id="example-form" class="flex flex-col gap-4">
                    <label class="flex flex-col">
                        What is your name?
                        <input class="border-1" type="text" name="name" placeholder="Matsuuu" />
                        ${when(form.errors.name, () => html`<span class="text-red-500">${form.errors.name}</span>`)}
                    </label>

                    <sl-input label="Other Name" name="otherName"></sl-input>

                    <button class="border-2 px-2 py-1" type="submit">Submit</button>
                </form>
            </div>
        `;
    };
}
