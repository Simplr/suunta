import { html, render } from 'lit-html';
import { Route, Suunta, SuuntaTarget } from 'suunta';
import { pendingApiResponse } from 'suunta/fetch';

const routes = [
    {
        path: '/foo',
        name: 'Foo',
        view: html`<p id="needle">Hello world!</p>`,
    },

    {
        path: '/',
        name: 'Home',
        view: html`<p id="needle">Hello world!</p>`,
        children: [
            {
                path: '/child-home',
                name: 'ChildHome',
                view: html`<p id="needle">Hello world!</p>`,
            },
        ],
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
    {
        path: '/',
        name: 'Redirect',
        redirect: 'Foo',
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

const defaultRoute = router.pathByRouteName('Bar');
router.pathByRouteName('ChildHome');
router.pathByRouteName('Foo');

router.resolve('ChildHome');
router.resolve('Foo');

router.getRoute({ name: 'Home' });
router.getRoute({ path: '/child-home' });

pendingApiResponse();
