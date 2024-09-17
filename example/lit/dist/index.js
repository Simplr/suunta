import { html, render } from 'lit-html';
import { Suunta } from 'suunta';
import { View as FooView } from './FooView';
import { SubView } from './SubView';
import { SubViewFloor } from './SubViewFloor';
console.log('Foo');
export let router;
const routes = [
    {
        path: '/',
        name: 'Home',
        view: html `<h2>Hello world!!</h2>
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
        view: () => html `<p>User page for id ${router?.getCurrentView()?.properties.id}</p>`,
    },
    {
        path: '/search/{matchAll}',
        name: 'Search',
        view: () => html `<p>Search page for ${router?.getCurrentView()?.properties.matchAll || 'Nothing'}</p>`,
    },
    {
        path: '/user/{id}(\\d+)/search/{matchAll}',
        name: 'User profile with search',
        view: () => html `
            <p>User page for id ${router?.getCurrentView()?.properties.id}</p>
            <p>Search page for ${router?.getCurrentView()?.properties.matchAll || 'Nothing'}</p>
        `,
    },
];
const renderer = (view, route, renderTarget) => {
    render(html `${view}`, renderTarget);
};
const options = {
    routes,
    renderer,
    target: 'body',
};
router = new Suunta(options);
router.start();
// @ts-ignore
window.ROUTER = router;
//# sourceMappingURL=index.js.map