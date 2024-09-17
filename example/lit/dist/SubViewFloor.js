import { html } from 'lit-html';
export function SubViewFloor() {
    return () => html `
        <p>And there's no limit. Also, the rendering will try to only render/unrender what's necessary</p>

        <button @click="${() => window.history.back()}">Go back</button>
    `;
}
//# sourceMappingURL=SubViewFloor.js.map