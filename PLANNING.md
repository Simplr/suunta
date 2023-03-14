# Should Suunta be a file based router?

We could have the router function in the same manner as Astro does the routing, 
but dynamically importing script files and and loading their default/view exports?

^ This would require some build time stuff tho... :/

Support lit-html by default but have a JSX support?


## TODO

- Implement a link click handler to trigger navigation events
- Build a test app with the current setup
- Look into supporting https://developer.chrome.com/docs/web-platform/view-transitions/
- Support sub-views / extra outlets
- Support lazy loading
- Add middleware support
- Add support for root paths / base path
