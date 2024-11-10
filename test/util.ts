// https://open-wc.org/docs/testing/testing-package/

import { html, render } from 'lit-html';
import { Route, Suunta, SuuntaTarget } from 'suunta';
import { BarView } from './views/bar';

export let router: Suunta | undefined;

export function clearRenders() {
    render(html``, document.body);
}

export const litRenderer = (view: unknown, route: Route, renderTarget: SuuntaTarget) => {
    render(html`${view}`, renderTarget);
};

export function getDynamicImportRouterSetup() {
    const FooView = () => import('./views/foo.js');
    const DefaultView = () => import('./views/default.js');
    render(DEFAULT_OUTLET, document.body);
    const routes: Route[] = [
        {
            path: '/',
            name: 'Home',
            view: html`<p id="needle">Hello world!</p>`,
        },
        {
            path: '/foo',
            name: 'Foo',
            view: FooView,
        },
        {
            path: '/bar',
            name: 'Bar',
            view: BarView,
        },
        {
            path: '/default',
            name: 'Default',
            view: DefaultView,
        },
    ];

    const routerOptions = {
        routes,
        target: '#outlet',
        renderer: litRenderer,
    };

    router = new Suunta(routerOptions);
    return router;
}

export const DEFAULT_OUTLET = html`<div id="outlet"></div>`;
export const OUTLET_ELEMENT_OUTLET = html`<suunta-view></suunta-view>`;

export function getBasicRouterSetup() {
    render(DEFAULT_OUTLET, document.body);
    const routes: Route[] = [
        {
            path: '/',
            name: 'Home',
            view: html`<p id="needle">Hello world!</p>`,
        },
        {
            path: '/foo',
            name: 'Foo',
            view: html`<p id="needle">Foo bar</p>`,
        },
        {
            path: '/anchor',
            name: 'Anchor',
            view: html`<a href="/user">To Users page</a>`,
        },
        {
            path: '/property',
            name: 'Property',
            view: () => html`<p>This page has the property: ${router?.getCurrentView()?.properties.foo}</p>`,
            properties: { foo: 'bar' },
        },
        {
            path: '/property/{id}',
            name: 'PropertyWithId',
            view: () =>
                // prettier-ignore
                html`<p>
                    This page has the property: ${router?.getCurrentView()?.properties.foo} and the ID ${router?.getCurrentView()?.properties.id}
                </p>`,
            properties: { foo: 'bar' },
        },
        {
            path: '/page',
            name: 'Page',
            view: html`<p>Link page</p>
                <a href="/page">page</a>`,
        },
        {
            path: '/user',
            name: 'User',
            view: html`<p>User page</p>`,
        },
        {
            path: '/user/{id}(\\d+)',
            name: 'User profile',
            view: () => html`<p>User page for id ${router?.getCurrentView()?.properties.id}</p>`,
        },
        {
            path: '/user/{id}(\\d+)/edit',
            name: 'User profile edit',
            view: () => html`<p>User edit page for id ${router?.getCurrentView()?.properties.id}</p>`,
        },
        {
            path: '/search/{matchAll}',
            name: 'Search',
            view: html`<p>Search page</p>`,
        },
        {
            path: '/{notFoundPath}(.*)',
            name: '404',
            view: html`<p>Page not found</p>`,
        },
        {
            path: '/redirect',
            name: 'Redirect',
            redirect: 'Foo',
        },
    ];

    const routerOptions = {
        routes,
        target: '#outlet',
        renderer: litRenderer,
    };

    router = new Suunta(routerOptions);
    return router;
}

export function getOutletSetup() {
    render(OUTLET_ELEMENT_OUTLET, document.body);
    const routes: Route[] = [
        {
            path: '/',
            name: 'Home',
            view: html`<p id="needle">Hello world!</p>`,
        },
        {
            path: '/foo',
            name: 'Foo',
            view: html`<p id="needle">Foo bar</p>`,
        },
        {
            path: '/outlet',
            name: 'Outlet',
            view: html`<div class="outlet-container">
                <suunta-view></suunta-view>
            </div>`,
            children: [
                {
                    path: '/child',
                    name: 'Child',
                    view: html` <p id="needle">Needle</p> `,
                },
                {
                    path: '/child-with-grandchild',
                    name: 'ChildWithGrandchild',
                    view: html`<suunta-view></suunta-view>`,
                    children: [
                        {
                            path: '/grandchild',
                            name: 'Grandchild',
                            view: html` <p id="needle">Needle</p> `,
                        },
                    ],
                },
            ],
        },
    ];

    const routerOptions = {
        routes,
        renderer: litRenderer,
    };

    router = new Suunta(routerOptions);
    return router;
}

export function getSessionId() {
    return new URL(window.location.href).searchParams.get('wtr-session-id');
}

export function navigateTo(url: string) {
    window.history.pushState(null, '', `${url}?wtr-session-id=${getSessionId()}`);
}
