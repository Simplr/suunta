import { Suunta, SuuntaInitOptions } from 'suunta';
import { expect } from '@esm-bundle/chai';
import { html, render } from 'lit-html';
import { SuuntaView } from '../lib/core/view';
import { Route } from 'suunta/route';
import { clearRenders, getBasicRouterSetup, litRenderer } from './util';

it('Should return a router instance', () => {
    clearRenders();
    const routerOptions: SuuntaInitOptions<Route> = {
        routes: [],
        target: 'body',
        renderer: litRenderer,
    };

    const router = new Suunta(routerOptions);

    expect(router).to.not.equal(null);
    expect(router instanceof Suunta).to.be.true;
});

it('Should start the router instance when given Element target', async () => {
    clearRenders();
    const routerOptions: SuuntaInitOptions<Route> = {
        routes: [
            {
                path: '/',
                name: 'Home',
                view: html``,
            },
        ],
        target: document.body,
        renderer: litRenderer,
    };

    const router = new Suunta(routerOptions);
    router.start();

    await new Promise(r => setTimeout(r, 100));

    expect(router).to.not.equal(null);
    expect(router instanceof Suunta).to.be.true;
});

it('Should set current view as the currentView', () => {
    clearRenders();
    const router = getBasicRouterSetup();

    const currentView: SuuntaView = {
        href: 'http://localhost:8080/',
        route: router.routes.get('/') as Route,
        properties: {},
    };

    expect(router.getCurrentView()).to.equal(undefined);

    router.start();

    const actualCurrentView = router.getCurrentView();
    expect(actualCurrentView?.route.name).to.equal(currentView.route.name);
    expect(actualCurrentView?.route.path).to.equal(currentView.route.path);
    expect(actualCurrentView?.route.properties).to.equal(currentView.route.properties);
});

it('Should render the HTML view', () => {
    const router = getBasicRouterSetup();

    router.start();

    const body = document.querySelector('body');
    const needle = body?.querySelector('#needle');

    expect(needle).to.not.be.null;
});

it('Should render the HTML view inside the BODY element', () => {
    clearRenders();

    const routes = [
        {
            path: '/',
            name: 'Home',
            view: html`<p id="needle">Hello world!</p>`,
        },
    ];

    const routerOptions: SuuntaInitOptions<Route> = {
        routes,
        target: 'body',
        renderer: litRenderer,
    };

    const router = new Suunta(routerOptions);

    router.start();

    const body = document.querySelector('body');
    const needle = body?.children.namedItem('needle');

    expect(needle).to.not.be.null;
});

it("Should render the HTML view inside the div[id='target-div'] element", () => {
    clearRenders();
    render(html``, document.body);

    const targetDiv = document.createElement('div');
    targetDiv.id = 'target-div';
    document.body.appendChild(targetDiv);

    const routes = [
        {
            path: '/',
            name: 'Home',
            view: html`<p id="needle">Hello world!</p>`,
        },
    ];

    const routerOptions: SuuntaInitOptions<Route> = {
        routes,
        target: '#target-div',
        renderer: litRenderer,
    };

    const router = new Suunta(routerOptions);

    const targetDivOnBody = document.querySelector("div[id='target-div']");

    router.start();

    const needle = targetDivOnBody?.querySelector('#needle');
    expect(needle).to.not.be.null;

    const needleInBodyChildren = document.body?.children.namedItem('needle');
    const needleInDivChildren = targetDivOnBody?.children.namedItem('needle');

    expect(needleInBodyChildren).to.be.null;
    expect(needleInDivChildren).to.not.be.null;
});
