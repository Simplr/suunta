import { html } from 'https://esm.sh/htm@3.0.4/preact';

export function Todo({ todo }) {
  const toggle = e => {
    todo.done = !todo.done;
  }

  return html`
    <li>
      <label>
        <input type="checkbox" checked=${todo.done} onClick=${toggle} />
        ${todo.text}
      </label>
    </li>
  `;
}
