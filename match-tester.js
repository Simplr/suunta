import { createRouteMatcher } from './lib/core/matcher.js';

const routes = [
    { path: '/home' },
    { path: '/home/event' },
    { path: '/home/{id}' },
    { path: '/home/{id}/foo' },
    { path: '/home/' },
];

const routesToMatch = ['/home/123/foo', '/home/123', '/home/123/'];

for (const route of routes) {
    const matcher = createRouteMatcher(route.path);
    console.log(matcher);
    if (matcher) {
        for (const m of routesToMatch) {
            console.log(m.match(matcher));
        }
    }
}
