import { basicSetup, EditorView } from 'codemirror';
import { keymap } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { indentWithTab } from '@codemirror/commands';

let editorElement = undefined;

const INITIAL_DATA = `

import { html, render } from 'lit';
import { Suunta, onNavigation, createState, onUpdated } from 'suunta';

const renderer = (view, route, renderTarget) => {
    render(html\`\${view}\`, renderTarget);
};

const routerOptions = {
    renderer,
    routes: [
        {
            path: '/',
            view: HomeView,
        },
        {
            path: '/foo',
            view: FooView,
        },
    ],
};

const router = new Suunta(routerOptions);

router.start();

function HomeView() {
    return () =>
        html\` <p>Hello World</p>
            <a href="/foo">Foo</a>\`;
}

function FooView() {
    console.log(router.routes);

  const state = createState({
    count: 0
  });
    return () => html\`
        <p>Foo World</p>
        <a href="/">Home</a>
        <button @click=$\{() => state.count++}>Clicked $\{state.count} times</button>
    \`;
}


`;

const editorView = new EditorView({
    doc: INITIAL_DATA,
    extensions: [
        basicSetup,
        javascript(),
        keymap.of([indentWithTab]),
        EditorView.updateListener.of(e => {
            if (!e.docChanged) {
                return;
            }
            const data = editorView.state.doc.toString();
            if (!editorElement) {
                editorElement = document.querySelector('.cm-editor');
            }
            try {
                evaluate(data);
                editorElement.removeAttribute('has-error');
            } catch (ex) {
                editorElement.setAttribute('has-error', '');
                console.error('Render failed ', ex);
            }
        }),
    ],
    parent: document.body,
});
/** @type { HTMLScriptElement } */
let SCRIPT_TAG = undefined;

function evaluate(code) {
    if (SCRIPT_TAG) {
        SCRIPT_TAG.remove();
    }
    SCRIPT_TAG = document.createElement('script');
    SCRIPT_TAG.type = 'module';
    document.body.appendChild(SCRIPT_TAG);

    SCRIPT_TAG.innerHTML = code;
    document.body.appendChild(SCRIPT_TAG);
}
evaluate(INITIAL_DATA);
