'use strict';

var chai = require('chai');
chai.use(require('chai-shallow-deep-equal'));
var equal = chai.assert.equal;
var sdEqual = chai.assert.shallowDeepEqual;

var clubExpr = require('../index');

var parse = clubExpr.parse;

describe('#parse', function() {
    it('should parse a single expression with one arg', function() {
        sdEqual(parse('(a b)'), ['a', 'b']);
    });

    it('should parse a single expression with two args', function() {
        sdEqual(parse('(a b c)'), ['a', 'b', 'c']);
    });

    it('should parse a nested expression', function() {
        sdEqual(parse('(a (b c) d)'), ['a', ['b', 'c'], 'd']);
    });
});

var renderExprAsLisp = clubExpr.renderExprAsLisp;

describe('#renderExprAsLisp', function() {
    it('should render a single expression with one arg', function() {
        equal(renderExprAsLisp(['a', 'b']), '(a b)');
    });

    it('should render a single expression with two args', function() {
        equal(renderExprAsLisp(['a', 'b', 'c']), '(a b c)');
    });

    it('should render a nested expression', function() {
        equal(renderExprAsLisp(['a', ['b', 'c'], 'd']), '(a (b c) d)');
    });
});

