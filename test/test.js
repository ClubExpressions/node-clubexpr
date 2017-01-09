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

var expressions = clubExpr.expressions;

describe('#renderingParsingRoundTrip', function() {
    it('should round trip on all official expressions', function() {
        expressions.forEach(function (exprObj) {
            var expr = exprObj.expr;
            // Here [ 'Somme', '1', '2' ] equals [ 'Somme', 1, 2 ]
            sdEqual(parse(renderExprAsLisp(expr)), expr);
        });
    });
});

var renderExprAsLaTeX = clubExpr.renderExprAsLaTeX;

describe('#renderExprAsLaTeX', function() {
    it('should render the official expressions correctly', function() {
        var exprsRenderedAsLaTeX = [
            '1+2',
            'a+1',
            '1+a',
            'a+b',
            '1-2',
            'a-1',
            '1-a',
            'a-b',
            '1×2',
            '1a',
            'a×1',
            'a×b',
            '\\frac{a}{1}',
            '\\frac{1}{a}',
            '1^2',
            'a^2',
            'a^1',
            '\\frac{1}{a}',
            '-a',
            '1\\left(a+2\\right)',
            '1\\left(a-2\\right)',
            '1+2a',
            '1a-2',
            '1+\\frac{a}{2}',
            '-a-1',
            '-\\left(a-1\\right)',
            '1-\\left(2+a\\right)',
            'a-1+2',
            '\\frac{a+b}{1}',
            '\\frac{1}{a+1}',
            '\\frac{1a}{2}',
            '-1a',
            '1+\\frac{2}{3a+4}'];
        expressions.forEach(function (exprObj, idx) {
            var expr = exprObj.expr;
            equal(renderExprAsLaTeX(expr), exprsRenderedAsLaTeX[idx]);
        });
    });
});

var replace = clubExpr.replaceValuesWith;

describe('#replace', function() {
    it('should replace "a" with "x" and 1 with 2 in a flat expr', function() {
        sdEqual(replace(['Somme', 'a', 1], {'a':'x', 1:2}),
                        ['Somme', 'x', 2]);
    });

    it('should replace "a" with "x" and 1 with 2 in a nested expr', function() {
        sdEqual(replace(['Produit', ['Somme', 1, 'a'], 3], {'a':'x', 1:2}),
                        ['Produit', ['Somme', 2, 'x'], 3]);
    });
});

