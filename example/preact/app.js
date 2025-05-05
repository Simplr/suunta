import { Todo } from './todo.js';
import { html } from 'https://esm.sh/htm@3.0.4/preact';
import { createState } from 'suunta/state';
import { onUpdated } from 'suunta/triggers';

export function App() {
    const INITIAL_TODOS = [
        { text: 'add HTM imports', done: true },
        { text: 'remove bundler', done: true },
        { text: 'write code', done: false },
    ];

    const { todos } = createState({
        todos: INITIAL_TODOS,
    });

    console.log(todos);

    onUpdated(updatedProperties => {
        console.log('Update', updatedProperties);
    });

    const add = function (e) {
        const text = e.target.todo.value;
        console.log(todos);
        todos.push({ text, done: false });
    };

    return () => html`
        <div class="app">
            <form action="javascript:" onSubmit=${add}>
                <input name="todo" placeholder="Add Todo [enter]" />
            </form>
            <ul>
                ${todos.map(todo => html` <${Todo} todo=${todo} /> `)}
            </ul>

            <a href="/secondary">Go to secondary page</a>
        </div>
    `;
}
