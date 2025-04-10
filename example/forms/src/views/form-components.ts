import { css, html, LitElement, PropertyValues, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import mainStyles from '../css/main.css?inline';
import { when } from 'lit-html/directives/when.js';
import { createForm } from 'suunta/form';
import { SuuntaForm } from '../../../../types/form/form';
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

@customElement('form-components')
export class FormComponents extends LitElement {
    @property({ type: String })
    name = 'World';

    form: SuuntaForm<FormSchema>;

    constructor() {
        super();
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        this.form = createForm({
            id: 'example-form',
            parent: this.shadowRoot,
            validator: ValidationSchema.safeParse,
            events: ['sl-blur', 'sl-change'],
            onErrorsUpdated: (errors, errorFields, removedErrors) => {
                this.requestUpdate();

                Object.entries(errorFields).forEach(([key, field]) => {
                    field.setAttribute('help-text', errors[key]);
                });
                Object.entries(removedErrors).forEach(([key, field]) => {
                    field.setAttribute('help-text', '');
                });
            },
        });
    }

    static styles = css`
        ${unsafeCSS(mainStyles)}
    `;

    render() {
        return html`
            <form id="example-form" class="flex flex-col gap-4">
                <label class="flex flex-col">
                    What is your name?
                    <input class="border-1" type="text" name="name" placeholder="Matsuuu" />
                    ${when(
                        this.form?.errors.name,
                        () => html`<span class="text-red-500">${this.form.errors.name}</span>`,
                    )}
                </label>

                <sl-input label="Other Name" name="otherName"></sl-input>

                <button class="border-2 px-2 py-1" type="submit">Submit</button>
            </form>
        `;
    }
}
