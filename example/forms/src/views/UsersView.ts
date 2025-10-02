import { html } from 'lit-html';
import { router } from '../router';
import { createState } from 'suunta/state';

export function UsersView() {
    // TODO: Figure out why this view  isn't reactive lol
    const state = createState({
        users: [{ name: makeid(10) }],
    });

    function addUser() {
        state.users.push({ name: makeid(10) });
    }

    function scrambleUser(user) {
        user.name = makeid(11);
    }

    return () => html`
        <div class="flex flex-col items-center justify-center h-full w-full gap-4">
            <h2 class="text-4xl">Users View</h2>
            <button class="border-1 p-2" @click=${addUser}>Add user</button>
            ${state.users.map(
                user => html`
                    <p>Name: ${user.name}</p>
                    <button class="border-1 p-2" @click=${() => scrambleUser(user)}>Scramble</button>
                `,
            )}
            <a class="underline" href="${router.resolve('HomeView')}">Home View</a>
            <a class="underline" href="${router.resolve('FormView')}">Form View</a>
            <a class="underline" href="${router.resolve('FormComponentView')}">Form component View</a>
            <a class="underline" href="${router.resolve('RequestView')}">Requests</a>
        </div>
    `;
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
