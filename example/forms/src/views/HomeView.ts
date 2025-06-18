import { html } from 'lit-html';
import { router } from '../router';

export function HomeView() {
    return () => html`
        <div class="flex flex-col items-center justify-center h-full w-full gap-4">
            <h2 class="text-4xl">HomeView</h2>
            <a class="underline" href="${router.resolve('FormView')}">Form View</a>
            <a class="underline" href="${router.resolve('FormComponentView')}">Form component View</a>
            <a class="underline" href="${router.resolve('RequestView')}">Requests</a>
        </div>
    `;
}
