import { html } from 'lit-html';
import { when } from 'lit/directives/when.js';
import { router } from '../router';
import { createForm } from 'suunta/form';

export function FormView() {
    createForm({});

    return () => html`
        <div class="flex flex-col items-center justify-center h-full w-full gap-4">
            <h2 class="text-4xl">FormView</h2>
            <a class="underline" href="${router.resolve('HomeView')}">Back</a>

            <form id="example-form" class="flex flex-col gap-4">
                <label class="flex flex-col">
                    What is your name?
                    <input class="border-1" type="text" name="name" placeholder="Matsuuu" />
                    ${when(true, () => html`<span class="text-red-500">foo</span>`)}
                </label>

                <button class="border-2 px-2 py-1" type="submit">Submit</button>
            </form>
        </div>
    `;
}
