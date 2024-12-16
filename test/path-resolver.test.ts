import { expect } from '@esm-bundle/chai';
import { clearRenders, getBasicRouterSetup, navigateTo } from './util';

it('Should be able to resolve static routes by name', async () => {
    clearRenders();
    navigateTo('/');

    await new Promise(r => setTimeout(r, 100));

    const router = getBasicRouterSetup();
    router.start();

    const homePath = router.pathByRouteName('Home');
    expect(homePath).to.equal('/');

    const fooPath = router.pathByRouteName('Foo');
    expect(fooPath).to.equal('/foo');
});

it('Should be able to resolve dynamic routes by name', async () => {
    clearRenders();
    navigateTo('/');

    await new Promise(r => setTimeout(r, 100));

    const router = getBasicRouterSetup();
    router.start();

    const propertyPath = router.pathByRouteName('PropertyWithId', 'abc-123');
    expect(propertyPath).to.equal('/property/abc-123');

    const userPath = router.pathByRouteName('User profile', 123);
    expect(userPath).to.equal('/user/123');

    const testAndFooPath = router.pathByRouteName('TestAndFoo', '12b', '456');
    expect(testAndFooPath).to.equal('/test/12b/foo/456');

    const testAndFooAndBarPath = router.pathByRouteName('TestAndFooAndBar', '12b', '456', 999);
    expect(testAndFooAndBarPath).to.equal('/test/12b/foo/456/bar/999');
});
