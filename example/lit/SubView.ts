import { html } from 'lit-html';
import { createState, onUpdated } from 'suunta';

export function SubView() {
    const state = createState({
        counter: 0,
    });

    onUpdated((name, oldValue, newValue) => {
        console.log({ name, oldValue, newValue });
    });

    return () => html`
        <p>
            This is a view. By adding a child view to this view, and appending a
            <code>&ltsuunta-view&gt</code> container into it, we can render subviews
        </p>

        <button @click=${() => state.counter++}>Current count is ${state.counter}</button>

        <a href="${window.location.href}/sub">Deeper</a>

        <suunta-view></suunta-view>
    `;
}
