import { html } from 'lit';
import { createState } from 'suunta';

export const View = () => {
    const state = createState({
        count: 0,
    });

    const addCount = () => {
        state.count += 1;
    };

    return () => html`
        <p>Foo View</p>
        <p>Count: ${state.count}</p>
        <button @click=${addCount}>Count++</button>
    `;
};
