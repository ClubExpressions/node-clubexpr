'use strict';

var chai = require('chai');
chai.use(require('chai-shallow-deep-equal'));
var sdEqual = chai.assert.shallowDeepEqual;

var parse = require('../index').parse;

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
