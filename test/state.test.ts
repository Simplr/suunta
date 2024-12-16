import { Route, Suunta, SuuntaInitOptions } from 'suunta';
import { clearRenders, litRenderer, navigateTo } from './util';
import { expect } from '@esm-bundle/chai';
import { StateTesterView } from './views/state-tester';
import { fixture, html } from '@open-wc/testing';

it('Should update state object no matter the depth', async () => {
    clearRenders();
    await new Promise(r => setTimeout(r, 100));

    const routerOptions: SuuntaInitOptions<Route> = {
        routes: [
            {
                path: '/',
                view: StateTesterView,
            },
        ],
        target: 'body',
        renderer: litRenderer,
    };

    navigateTo('/');

    const router = new Suunta(routerOptions);
    router.start();

    await new Promise(r => setTimeout(r, 100));

    expect(router).to.not.equal(null);
    expect(router instanceof Suunta).to.be.true;

    //
    const userInfoDiv = document.querySelector('#user-info');

    const initialFixture = await fixture(html`
        <div id="user-info">
            <p>User info</p>
            <ul>
                <li>12</li>
                <li>User One</li>
                <ul>
                    <li>Make food</li>
                    <li>Rewrite in Rust</li>
                </ul>
                <ul>
                    <ul>
                        <li>2024-01-01</li>
                        <li>1</li>
                    </ul>
                </ul>
            </ul>
        </div>
    `);

    expect(document.querySelector('h2')?.innerText).to.equal('Hello World');
    expect(initialFixture).dom.to.equal(userInfoDiv?.outerHTML);
    //

    //
    document.querySelector('#update-name').click();
    await new Promise(r => setTimeout(r, 100));

    expect(document.querySelector('h2')?.innerText).to.equal('Hello Matsu');

    //

    //
    document.querySelector('#update-user-id').click();
    await new Promise(r => setTimeout(r, 100));

    const postUserIdClickFixture = await fixture(html`
        <div id="user-info">
            <p>User info</p>
            <ul>
                <li>345</li>
                <li>User One</li>
                <ul>
                    <li>Make food</li>
                    <li>Rewrite in Rust</li>
                </ul>
                <ul>
                    <ul>
                        <li>2024-01-01</li>
                        <li>1</li>
                    </ul>
                </ul>
            </ul>
        </div>
    `);

    expect(postUserIdClickFixture).dom.to.equal(userInfoDiv?.outerHTML);

    //

    //
    document.querySelector('#update-user-name').click();
    await new Promise(r => setTimeout(r, 100));

    const postUserNameClickFixture = await fixture(html`
        <div id="user-info">
            <p>User info</p>
            <ul>
                <li>345</li>
                <li>Foobar</li>
                <ul>
                    <li>Make food</li>
                    <li>Rewrite in Rust</li>
                </ul>
                <ul>
                    <ul>
                        <li>2024-01-01</li>
                        <li>1</li>
                    </ul>
                </ul>
            </ul>
        </div>
    `);

    expect(postUserNameClickFixture).dom.to.equal(userInfoDiv?.outerHTML);
    //

    //
    document.querySelector('#update-user-notes').click();
    await new Promise(r => setTimeout(r, 100));

    const postUserNotesUpdateClickFixture = await fixture(html`
        <div id="user-info">
            <p>User info</p>
            <ul>
                <li>345</li>
                <li>Foobar</li>
                <ul>
                    <li>Eat food</li>
                    <li>Rewrite in Go</li>
                </ul>
                <ul>
                    <ul>
                        <li>2024-01-01</li>
                        <li>1</li>
                    </ul>
                </ul>
            </ul>
        </div>
    `);

    expect(postUserNotesUpdateClickFixture).dom.to.equal(userInfoDiv?.outerHTML);
    //

    //
    document.querySelector('#add-user-note').click();
    await new Promise(r => setTimeout(r, 100));

    const postUserNotesAddClickFixture = await fixture(html`
        <div id="user-info">
            <p>User info</p>
            <ul>
                <li>345</li>
                <li>Foobar</li>
                <ul>
                    <li>Eat food</li>
                    <li>Rewrite in Go</li>
                    <li>Touch grass</li>
                </ul>
                <ul>
                    <ul>
                        <li>2024-01-01</li>
                        <li>1</li>
                    </ul>
                </ul>
            </ul>
        </div>
    `);

    expect(postUserNotesAddClickFixture).dom.to.equal(userInfoDiv?.outerHTML);
    //

    //
    document.querySelector('#replace-user-liked-notes').click();
    await new Promise(r => setTimeout(r, 100));

    const postUserLikedNotesUpdateClickFixture = await fixture(html`
        <div id="user-info">
            <p>User info</p>
            <ul>
                <li>345</li>
                <li>Foobar</li>
                <ul>
                    <li>Eat food</li>
                    <li>Rewrite in Go</li>
                    <li>Touch grass</li>
                </ul>
                <ul>
                    <ul>
                        <li>2024-02-02</li>
                        <li>5</li>
                    </ul>
                    <ul>
                        <li>2024-03-03</li>
                        <li>10</li>
                    </ul>
                </ul>
            </ul>
        </div>
    `);
    expect(postUserLikedNotesUpdateClickFixture).dom.to.equal(userInfoDiv?.outerHTML);
    //

    //
    document.querySelector('#add-user-liked-note').click();
    await new Promise(r => setTimeout(r, 100));

    const postUserLikedNotesAddClickFixture = await fixture(html`
        <div id="user-info">
            <p>User info</p>
            <ul>
                <li>345</li>
                <li>Foobar</li>
                <ul>
                    <li>Eat food</li>
                    <li>Rewrite in Go</li>
                    <li>Touch grass</li>
                </ul>
                <ul>
                    <ul>
                        <li>2024-02-02</li>
                        <li>5</li>
                    </ul>
                    <ul>
                        <li>2024-03-03</li>
                        <li>10</li>
                    </ul>

                    <ul>
                        <li>2024-04-04</li>
                        <li>15</li>
                    </ul>
                </ul>
            </ul>
        </div>
    `);
    expect(postUserLikedNotesAddClickFixture).dom.to.equal(userInfoDiv?.outerHTML);
    //
});
