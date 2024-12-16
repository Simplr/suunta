import { html } from 'lit-html';
import { createState } from 'suunta';

export function UndefinedStateTester() {
    const state = createState({
        name: undefined,
        user: undefined,
    });

    function setName() {
        state.name = 'Matsu';
    }

    function setUserThings() {
        state.user = {
            id: 1,
            name: 'Foo',
        };
    }

    return () => html`
        <p>My name is ${state.name || 'World'}</p>

        <label>User Id: ${state.user?.id || 'Not Set'}, Name: ${state.user?.name || 'Not Set'}</label>

        <button id="set-name" @click=${setName}>Button</busetUserThings>
        <button id="set-user-things" @click=${setUserThings}>Button</button>
    `;
}
