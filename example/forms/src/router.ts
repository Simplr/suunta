import { html, render } from 'lit';
import { Suunta } from 'suunta';
import { HomeView } from './views/HomeView';
import { FormView } from './views/FormView';
import { FormComponentView } from './views/FormComponentView';
import { RequestView } from './views/RequestView';
import { UsersView } from './views/UsersView';

const routes = [
    {
        path: '/',
        name: 'HomeView',
        view: HomeView,
    },
    {
        path: '/form',
        name: 'FormView',
        view: FormView,
    },
    {
        path: '/users',
        name: 'UsersView',
        view: UsersView,
    },
    {
        path: '/form-component',
        name: 'FormComponentView',
        view: FormComponentView,
    },
    {
        path: '/requests',
        name: 'RequestView',
        view: RequestView,
    },
] as const;

// This part can be written however you want. Suunta provides you with the
// necessary data, you handle the rendering.
const renderer = (view, route, renderTarget) => {
    render(html`${view}`, renderTarget);
};

const routerOptions = {
    routes,
    renderer,
    target: document.body,
};

export const router = new Suunta(routerOptions);

export function startRouter() {
    router.start();
}
