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
            'ab',
            'a×a',
            '\\frac{1}{2}',
            '\\frac{a}{1}',
            '\\frac{1}{a}',
            '\\frac{a}{b}',
            '1^2',
            'a^2',
            'a^1',
            '\\frac{1}{a}',
            '-a',
            '1\\left(a+2\\right)',
            '1\\left(a-2\\right)',
            '1+2a',
            '1-\\left(-2\\right)',
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
            '-\\frac{1}{a}',
            '-\\frac{a}{b}',
            '-a^2',
            '\\left(-a\\right)^2',
            '\\left(1+a\\right)^2',
            '1+a^2',
            '1a^2',
            '\\left(1a\\right)^2',
            '\\frac{a^2}{1}',
            '\\left(\\frac{a}{1}\\right)^2',
            'a×1a',
            '\\left(\\frac{1}{a}\\right)^2',
            '\\frac{1}{a^2}',
            '\\sqrt{a^2}',
            '\\sqrt{a^2+b^2}',
            'a\\left(1+2a\\right)',
            '1a-\\left(2+a\\right)',
            '1a-2a',
            '1\\left(a-2\\right)-3',
            '1-2\\left(a+3\\right)',
            '1a-a+2',
            'a-\\frac{a}{1}+2',
            'a^2-a+1',
            '\\left(a+1\\right)^2-2',
            '\\left(a+1\\right)\\left(a-2\\right)',
            '-a^2+1',
            '1a^2+a',
            '\\frac{a+1}{a-2}',
            '1+\\frac{2}{a+3}',
            '\\sqrt{\\left(1-2\\right)^2+\\left(3+4\\right)^2}',
            '1\\left(2+3\\right)\\left(4+5\\right)',
            'a^2+1a+2',
            '1\\left(a+2\\right)^2-3',
            '1\\left(2+3\\right)\\left(4-5\\right)',
            '\\left(a+1\\right)^2-a^2',
            '1a^2+2a+3',
            '\\frac{1a+2}{3a+4}',
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

