import { html } from 'https://esm.sh/htm@3.0.4/preact';
import { createState } from 'suunta/state';

export function Secondary() {
    let state = createState({
        count: 0,
    });

    const addCount = () => {
        state.count += 1;
    };

    return () => html`
        <div class="app">
            <p>This is the secondary page</p>
            <p>Count: ${state.count}</p>

            <button onClick=${addCount}>Counter++</button>
            <a href="/">Go back</a>
        </div>
    `;
}
