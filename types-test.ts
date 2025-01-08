import { html, render } from 'lit-html';
import { Route, Suunta, SuuntaTarget } from 'suunta';

const routes = [
    {
        path: '/',
        name: 'Home',
        view: html`<p id="needle">Hello world!</p>`,
    },
    {
        path: '/foo',
        name: 'Foo',
        view: html`<p id="needle">Hello world!</p>`,
    },
    {
        path: '/bar',
        name: 'Bar',
        view: html`<p id="needle">Hello world!</p>`,
    },
    {
        path: '/default',
        name: 'Default',
        view: html`<p id="needle">Hello world!</p>`,
    },
] as const;

export const litRenderer = (view: unknown, route: Route, renderTarget: SuuntaTarget) => {
    render(html`${view}`, renderTarget);
};

const routerOptions = {
    routes,
    target: '#outlet',
    renderer: litRenderer,
};

const router = new Suunta(routerOptions);

router.pathByRouteName('Foo');
router.pathByRouteName('Bin');
