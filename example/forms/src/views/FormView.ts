import { html } from 'lit-html';
import { router } from '../router';

export function FormView() {
    return () => html`
        <div class="flex flex-col items-center justify-center h-full w-full gap-4">
            <h2 class="text-4xl">FormView</h2>
            <a class="underline" href="${router.resolve('HomeView')}">Back</a>
        </div>
    `;
}
