'use strict';

var chai = require('chai');
chai.use(require('chai-shallow-deep-equal'));
var assert = chai.assert;
var equal = chai.assert.equal;
var sdEqual = chai.assert.shallowDeepEqual;
function treeEquals(x, y) {return sdEqual(x.tree, y);}

var clubExpr = require('../index');

var parse = clubExpr.parse;

describe('#parse', function() {
    it('should fail if the source contains bad characters', function() {
        assert.throw(function () {parse('"');},
                     Error, "Invalid char: \"");
    });

    it('should fail if the source is empty', function() {
        assert.throw(function () {parse('');},
                     Error, "Empty expr");
    });

    it('should parse an expression with no arg', function() {
        treeEquals(parse('(a)'), ['a']);
    });

    it('should parse an expression with no arg (longer command)', function() {
        treeEquals(parse('(ab)'), ['ab']);
    });

    it('should parse a single expression with one arg', function() {
        treeEquals(parse('(a b)'), ['a', 'b']);
    });

    it('should parse a single expression with two args', function() {
        treeEquals(parse('(a b c)'), ['a', 'b', 'c']);
    });

    it('should parse a nested expression', function() {
        treeEquals(parse('(a (b c) d)'), ['a', ['b', 'c'], 'd']);
    });

    it('should parse an expression with creative whitespace', function() {
        treeEquals(parse(' ( a \n b \t c ) '), ['a', 'b', 'c']);
    });

    it('should fail if the starting ( is missing', function() {
        assert.throw(function () {parse('a');},
                     Error, "Missing starting (");
    });

    it('should fail if a double ( is found', function() {
        assert.throw(function () {parse('((');},
                     Error, "Double (");
    });

    it('should warn us if a ) is missing', function() {
        var result = parse('(a b');
        sdEqual(result.warnings, ["Missing )"]);
        sdEqual(result.tree, ['a', 'b']);
    });

    it('should warn us if a ) is missing in a nested expression', function() {
        var result = parse('(a (b 2)');
        sdEqual(result.warnings, ["Missing )"]);
        sdEqual(result.tree, ['a', ['b', '2']]);
    });

    it('should warn us if the expr is already closed', function() {
        var result = parse('(a b) c');
        sdEqual(result.warnings, ["Already closed"]);
        sdEqual(result.tree, ['a', 'b']);
    });

    it('should warn us if a ) is trailing', function() {
        var result = parse('(a b))');
        sdEqual(result.warnings, ["Already closed"]);
        sdEqual(result.tree, ['a', 'b']);
    });

    it('should warn us if a ( is trailing', function() {
        var result = parse('(a b) (');
        sdEqual(result.warnings, ["Already closed"]);
        sdEqual(result.tree, ['a', 'b']);
    });

    it('should fail if a command is missing', function() {
        assert.throw(function () {parse('()');},
                     Error, "Missing cmd");
    });
});

var natureFromLisp = clubExpr.natureFromLisp;

describe('#natureFromLisp', function() {
    it('should fail silently for some malformed expressions', function() {
        var expressions = ['', 'b', ')', '(S'];
        expressions.forEach(function (src) {
            equal(natureFromLisp(src), '');
        });
    });

    it('should fail silently for some wellformed expressions', function() {
        var expressions = ['(S 1 1)'];
        expressions.forEach(function (src) {
            equal(natureFromLisp(src), '');
        });
    });

    it('should return the correct nature of some expressions', function() {
        var exprsAndNatures = [
            ['Somme 1 1)', 'Somme'],
            [' Somme 1 1)', 'Somme'],
            ['  Somme 1 1)', 'Somme'],
            ['Somme(', 'Somme'],
            ['(Somme 1 1)', 'Somme'],
            [' (Somme 1 1)', 'Somme'],
            ['( Somme 1 1)', 'Somme'],
            ['(Somme(', 'Somme'],
            [' ( Somme 1 1)', 'Somme']
        ];
        exprsAndNatures.forEach(function (exprAndNature) {
            var src =    exprAndNature[0];
            var nature = exprAndNature[1];
            equal(natureFromLisp(src), nature);
        });
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
            treeEquals(parse(renderExprAsLisp(expr)), expr);
        });
    });
});

var renderExprAsLaTeX = clubExpr.renderExprAsLaTeX;
var exprsRenderedAsLaTeX = [
            '1+2',
            'a+1',
            '1+a',
            'a+b',
            '1-2',
            'a-1',
            '1-a',
            'a-b',
            '1 \\times 2',
            '1 a',
            'a \\times 1',
            'a b',
            'a \\times a',
            '\\frac{1}{2}',
            '\\frac{a}{1}',
            '\\frac{1}{a}',
            '\\frac{a}{b}',
            '{1}^{2}',
            '{a}^{2}',
            '{a}^{1}',
            '\\frac{1}{a}',
            '-a',
            '1 \\left(a+2\\right)',
            '1 \\left(a-2\\right)',
            '1+2 a',
            '1+\\left(-2\\right)',
            '1+\\left(-a\\right)',
            '1-\\left(-2\\right)',
            '1-\\left(-a\\right)',
            '1 a-2',
            '1+\\frac{a}{2}',
            '-a-1',
            '-\\left(a-1\\right)',
            '1-\\left(2+a\\right)',
            'a-1+2',
            '\\frac{a+b}{1}',
            '\\frac{1}{a+1}',
            '{a}^{b+c}',
            '{a}^{{b}^{c}}',
            '{\\left({a}^{b}\\right)}^{c}',
            '\\frac{1 a}{2}',
            '-1 a',
            '-\\frac{1}{a}',
            '-\\frac{a}{b}',
            '-{a}^{2}',
            '{\\left(-a\\right)}^{2}',
            '{\\left(1+a\\right)}^{2}',
            '{\\left(a+b\\right)}^{2}',
            '{\\left(a-b\\right)}^{2}',
            '1+{a}^{2}',
            '1 {a}^{2}',
            '{\\left(1 a\\right)}^{2}',
            '\\frac{{a}^{2}}{1}',
            '{\\left(\\frac{a}{1}\\right)}^{2}',
            'a \\times 1 a',
            '{\\left(\\frac{1}{a}\\right)}^{2}',
            '\\frac{1}{{a}^{2}}',
            '\\sqrt{{a}^{2}}',
            '{a}^{2}+{b}^{2}',
            '\\sqrt{{a}^{2}+{b}^{2}}',
            'a \\left(1+2 a\\right)',
            '1 a-\\left(2+a\\right)',
            '1 a-2 a',
            '1 \\left(a-2\\right)-3',
            '1-2 \\left(a+3\\right)',
            '1 a-a+2',
            'a-\\frac{a}{1}+2',
            '{a}^{2}-a+1',
            '{\\left(a+1\\right)}^{2}-2',
            '\\left(a+1\\right) \\left(a-2\\right)',
            '-{a}^{2}+1',
            '1 {a}^{2}+a',
            '-a-a+1',
            'a-\\left(-a\\right)+1',
            '{a}^{2}-a+1',
            'a-1 \\left(a-2\\right)+3',
            '\\frac{a+1}{a-2}',
            '1+\\frac{2}{a+3}',
            '\\sqrt{{\\left(1-2\\right)}^{2}+{\\left(3+4\\right)}^{2}}',
            '1 \\left(2+3\\right) \\left(4+5\\right)',
            '{a}^{2}+1 a+2',
            '1 {\\left(a+2\\right)}^{2}-3',
            '1 \\left(2+3\\right) \\left(4-5\\right)',
            '{\\left(a+1\\right)}^{2}-{a}^{2}',
            '1 {a}^{2}+2 a+3',
            '\\frac{1 a+2}{3 a+4}',
            '1+\\frac{2}{3 a+4}'];

describe('#renderExprAsLaTeX', function() {
    it('should render the official expressions correctly', function() {
        expressions.forEach(function (exprObj, idx) {
            var expr = exprObj.expr;
            equal(renderExprAsLaTeX(expr), exprsRenderedAsLaTeX[idx]);
        });
    });
});

var renderLispAsLaTeX = clubExpr.renderLispAsLaTeX;

describe('#renderLispAsLaTeX', function() {
    it('should render a single expression with one arg', function() {
        equal(renderLispAsLaTeX('(Racine b)'), '\\sqrt{b}');
    });

    it('should render a single expression with two args', function() {
        equal(renderLispAsLaTeX('(Somme a b)'), 'a+b');
    });

    it('should render a nested expression', function() {
        equal(renderLispAsLaTeX('(Somme a (Produit b c))'), 'a+b c');
    });

    it('should render an expression with a greek letter', function() {
        equal(renderLispAsLaTeX('(Produit 2 pi)'), '2 \\pi');
    });

    it('should fail if the command is unknown', function() {
        assert.throw(function () {renderLispAsLaTeX('(Unk a b)');},
                     Error, "Unknown cmd: Unk");
    });

    it('should fail if too few args for Somme', function() {
        assert.throw(function () {renderLispAsLaTeX('(Somme a)');},
                     Error, "Somme: nb args < 2");
    });

    it('should fail if too few args for Diff', function() {
        assert.throw(function () {renderLispAsLaTeX('(Diff a)');},
                     Error, "Diff: nb args < 2");
    });

    it('should fail if too many args for Diff', function() {
        assert.throw(function () {renderLispAsLaTeX('(Diff a b c)');},
                     Error, "Diff: nb args > 2");
    });

    it('should fail if a leaf is not allowed', function() {
        assert.throw(function () {renderLispAsLaTeX('(a bc)');},
                     Error, "Bad leaf: bc");
    });
});

var replace = clubExpr.replaceValuesWith;

describe('#replace', function() {
    it('should replace "a" with "x" and 1 with 2 in a flat expr', function() {
        sdEqual(replace(['Somme', 'a', 1], {'a':'x', 1:2}),
                        ['Somme', 'x', 2]);
    });

    it('should replace "a" with "x" and conversely in a flat expr', function() {
        sdEqual(replace(['Somme', 'a', 'x'], {'a':'x', 'x':'a'}),
                        ['Somme', 'x', 'a']);
    });

    it('should replace "a" with "x" and 1 with 2 in a nested expr', function() {
        sdEqual(replace(['Produit', ['Somme', 1, 'a'], 3], {'a':'x', 1:2}),
                        ['Produit', ['Somme', 2, 'x'], 3]);
    });
});
