# node-clubexpr

Expressions and utilities for the Club of Expressions.

[See the demo page](https://clubexpressions.github.io/node-clubexpr/)

[npm page](https://www.npmjs.com/package/clubexpr)

## Build

* `npm run build-demo` builds the old list of expressions with their properties
  (the `demo.js` file at the root of the project).
* `npm run build-react-demo` builds the shiny react demo (see `react` dir).

## Test, bump version and publish

    npm run test
    npm version patch
    npm login  # if needed
    npm publish
