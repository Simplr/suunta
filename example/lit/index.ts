import { html, render } from 'lit-html';
import { Route, Suunta, SuuntaInitOptions, SuuntaTarget } from 'suunta';
import { View as FooView } from './FooView';
import { SubView } from './SubView';
import { SubViewFloor } from './SubViewFloor';

console.log('Foo');

let GLOBAL_CLICKER = 0;

export function updateGlobalClicker(val: number) {
    GLOBAL_CLICKER = val;
}

export function getGlobalClicker() {
    return GLOBAL_CLICKER;
}

export let router: Suunta | undefined;

const routes: Route[] = [
    {
        path: '/',
        name: 'Home',
        view: html`<h2>Hello world!!</h2>
            <a href="/foo">Foo</a> <a href="/sub">SubView</a>`,
    },
    {
        path: '/foo',
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
        view: () => html`<p>User page for id ${router?.getCurrentView()?.properties.id}</p>`,
    },
    {
        path: '/search/{matchAll}',
        name: 'Search',
        view: () => html`<p>Search page for ${router?.getCurrentView()?.properties.matchAll || 'Nothing'}</p>`,
    },
    {
        path: '/user/{id}(\\d+)/search/{matchAll}',
        name: 'User profile with search',
        view: () => html`
            <p>User page for id ${router?.getCurrentView()?.properties.id}</p>
            <p>Search page for ${router?.getCurrentView()?.properties.matchAll || 'Nothing'}</p>
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

// @ts-ignore
window.ROUTER = router;

