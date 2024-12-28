import { html } from 'lit';
import { createState } from 'suunta';
import { globalState } from '.';

export const View = () => {
    const state = createState({
        count: 0,
    });

    const addCount = () => {
        state.count += 1;
    };

    const addGlobalCount = () => {
        globalState.count += 1;
    };

    return () => html`
        <a href="/"> Back home</a>
        <p>Foo View</p>
        <p>Count: ${state.count}</p>
        <p>Global Count: ${globalState.count}</p>
        <button @click=${addCount}>Count++</button>
        <button @click=${addGlobalCount}>Global State Count++</button>
    `;
};
