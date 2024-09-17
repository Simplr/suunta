import { html, render } from 'lit';
import { Suunta, onNavigation, createState, onUpdated } from 'suunta';
import { basicSetup, EditorView } from 'codemirror';
import { keymap } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { indentWithTab } from '@codemirror/commands';

let editorElement = undefined;

const INITIAL_DATA = `
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
    return () => html\`
        <p>Foo World</p>
        <a href="/">Home</a>
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
                eval(data);
                editorElement.removeAttribute('has-error');
            } catch (ex) {
                editorElement.setAttribute('has-error', '');
            }
        }),
    ],
    parent: document.body,
});

eval(INITIAL_DATA);

/*const textarea = document.querySelector('textarea');

textarea.addEventListener('input', e => {
    const target = e.target;
    try {
        eval(target.value);
        textarea.removeAttribute('has-error');
    } catch (ex) {
        textarea.setAttribute('has-error', '');
    }
});

eval(textarea.value);*/
