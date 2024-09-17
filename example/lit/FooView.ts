import { html } from 'lit';
import { createState, onNavigation, onUpdated } from 'suunta';

export const View = () => {
    onNavigation(() => {
        console.log('Loading view');
    });

    onUpdated((property, oldValue, newValue) => {
        console.log('Updated', { property, oldValue, newValue });
    });

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
