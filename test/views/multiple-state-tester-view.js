import { html } from 'lit-html';
import { createState } from 'suunta';

export function MultipleStateTesterView() {
    const state = createState({
        name: 'World',
        user: {
            id: 12,
            clicks: 0,
        },
    });

    const anotherState = createState({
        name: 'World',
        user: {
            id: 12,
            clicks: 0,
        },
    });

    function updateName() {
        state.name = 'Matsu';
    }

    function updateUserId() {
        state.user.id = 345;
    }

    function increment() {
        state.user.clicks += 1;
    }

    function updateAnotherName() {
        anotherState.name = 'Matsu';
    }

    function updateAnotherUserId() {
        anotherState.user.id = 345;
    }

    function incrementAnother() {
        anotherState.user.clicks += 1;
    }

    return () => html`
        <div id="initial">
            <h2>Hello ${state.name}</h2>

            <div id="user-info">
                <p>User info</p>
                <ul>
                    <li>${state.user.id}</li>
                </ul>

                <p id="clicks">Clicked ${state.user.clicks} times</p>
            </div>

            <button id="update-name" @click=${updateName}>Update</button>
            <button id="update-user-id" @click=${updateUserId}>Update</button>
            <button id="increment" @click=${increment}>Increment</button>
        </div>

        <div id="secondary">
            <h2>Hello ${anotherState.name}</h2>

            <div id="user-info">
                <p>User info</p>
                <ul>
                    <li>${anotherState.user.id}</li>
                </ul>

                <p id="clicks">Clicked ${anotherState.user.clicks} times</p>
            </div>

            <button id="update-another-name" @click=${updateAnotherName}>Update</button>
            <button id="update-another-user-id" @click=${updateAnotherUserId}>Update</button>
            <button id="increment-another" @click=${incrementAnother}>Increment</button>
        </div>
    `;
}
