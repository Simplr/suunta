import { html } from 'lit-html';
import { createState } from 'suunta/state';
import { onUpdated } from 'suunta/triggers';
import { getGlobalClicker, router, updateGlobalClicker } from '.';

export function SubView() {
    const state = createState({
        counter: getGlobalClicker(),
    });

    onUpdated(updatedProperties => {
        console.log(updatedProperties);
    });

    function sync() {
        updateGlobalClicker(state.counter);
        router?.refreshAllViews();
    }

    return () => html`
        <p>
            This is a view. By adding a child view to this view, and appending a
            <code>&ltsuunta-view&gt</code> container into it, we can render subviews
        </p>

        <button @click=${() => state.counter++}>Current count is ${state.counter}</button>

        <button @click=${sync}>Set click value to all</button>

        <p>Global: ${getGlobalClicker()}</p>

        <a href="${window.location.href}/sub">Deeper</a>

        <suunta-view></suunta-view>
    `;
}
