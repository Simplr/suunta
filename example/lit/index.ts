import { html, render } from 'lit-html';
import { View as FooView } from './FooView';
import { SubView } from './SubView';
import { SubViewFloor } from './SubViewFloor';
import { Suunta } from '../../lib/core/suunta';
import { Route, SuuntaInitOptions, SuuntaTarget } from '../../lib/core/route';
import { createGlobalState } from '../../lib/core/state';

console.log('Foo');

export let router: Suunta<Route>;

const routes: Route[] = [
    {
        path: '/',
        name: 'Home',
        title: 'Home',
        view: html`<h2>Hello world!!</h2>
            <a href="/foo">Foo</a> <a href="/sub">SubView</a>`,
    },
    {
        path: '/foo',
        title: 'Lit Example - Foo',
        view: FooView,
    },
    {
        path: '/sub',
        view: SubView,
        children: [
            {
                path: '/sub',
                view: SubView,
                children: [
                    {
                        path: '/sub',
                        view: SubView,
                        children: [
                            {
                                path: '/sub',
                                view: SubViewFloor,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        path: '/user/{id}(\\d+)',
        name: 'User profile',
        view: () => html`<p>User page for id ${router.getCurrentView()?.params?.id}</p>`,
    },
    {
        path: '/search/{matchAll}',
        name: 'Search',
        view: () => html`<p>Search page for ${router.getCurrentView()?.params?.matchAll || 'Nothing'}</p>`,
    },
    {
        path: '/user/{id}(\\d+)/search/{matchAll}',
        name: 'User profile with search',
        view: () => html`
            <p>User page for id ${router?.getCurrentView()?.params?.id}</p>
            <p>Search page for ${router?.getCurrentView()?.params?.matchAll || 'Nothing'}</p>
        `,
    },
];

const renderer = (view: unknown, route: Route, renderTarget: SuuntaTarget) => {
    render(html`${view}`, renderTarget);
};

const options: SuuntaInitOptions<Route> = {
    routes,
    renderer,
    target: 'body',
};

router = new Suunta(options);

router.start();

export const globalState = createGlobalState({
    count: 0,
});

// @ts-ignore
window.ROUTER = router;

let GLOBAL_CLICKER = 0;

export function updateGlobalClicker(val: number) {
    GLOBAL_CLICKER = val;
}

export function getGlobalClicker() {
    return GLOBAL_CLICKER;
}
