'use strict'

/**
 * Collection of expressions and utilities for the Club of Expressions :
 *
 * * `parse` : from Lisp source to nested JS arrays
 *
 * @summary Expressions and utilities for the Club of Expressions.
 */

/**
 * @summary Parses Lisp source which represents an expression.
 *
 * Adapted from <https://www.recurse.com/blog/21-little-lisp-interpreter>
 * Just added «input.» and skipped `categorize`.
 *
 * @param src The Lisp source
 * @return A nested JS array
 */
exports.parse = function(input) {
  return parenthesize(tokenize(input));
};

var tokenize = function(input) {
  return input.replace(/\(/g, ' ( ')
        .replace(/\)/g, ' ) ')
        .trim()
        .split(/\s+/);
};

var parenthesize = function(input, list) {
  if (list === undefined) {
    return parenthesize(input, []);
  } else {
    var token = input.shift();
    if (token === undefined) {
      return list.pop();
    } else if (token === "(") {
      list.push(parenthesize(input, []));
      return parenthesize(input, list);
    } else if (token === ")") {
      return list;
    } else {
      return parenthesize(input, list.concat(token));
    }
  }
};

/**
 * @summary Renders an expression Lisp source.
 *
 * @param expr An expression
 * @return Lisp source, aka Code Club
 */
exports.renderExprAsLisp = function (expr) {
    if (typeof expr === 'object') {
        var cmd = expr[0];
        var args = expr.slice(1).map(exports.renderExprAsLisp);
        return '(' + cmd + ' ' + args.join(' ') + ')';
    } else {
        return expr;
    }
}

exports.expressions = function () {
  // For convenience, definitions are done with variables (avoid quotes).
  var a = 'a';
  var b = 'b';
  var c = 'c';
  var d = 'd';
  var e = 'e';
  var f = 'f';
  var g = 'g';
  // Opérations:
  var S  = 'Somme';
  var D  = 'Diff';
  var P  = 'Produit';
  var Q  = 'Quotient';
  var O  = 'Opposé';
  var I  = 'Inverse';
  var C  = 'Carré';
  var Pu = 'Puissance';
  var R  = 'Racine';
  // Les calculs entre parenthèses sont prioritaires.
  var Pa = 'parenthèses';
  // Dans une expression sans parenthèses avec uniquement des additions et des
  // soustractions, on effectue les calculs de gauche à droite.
  var GD = 'gauche-droite';
  // Dans une expression sans parenthèses, les multiplications et les divisions
  // ont priorité sur les additions, les soustractions et les passages à l'opposé.
  var MD = 'mult-div';
  // Dans une expression sans parenthèses, l'élévation à une puissance a priorité
  // sur les quatre opérations usuelles et sur le passage à l'opposé.
  var El = 'élévation';
  // Dans une expression sans parenthèses, le passage à l'opposé a priorité sur
  // l'addition et la soustraction.
  var Op = 'opposé';
  // Devant une lettre ou une parenthèse, le signe « × » de la multiplication est
  // facultatif.
  var X = 'signe ×';
  // Lorsque la division est indiquée par un trait de fraction, les parenthèses
  // autour des expressions au numérateur et au dénominateur sont facultatives.
  var F = 'fraction';

  // The expressions (from the boss himself)
  return [
  {"nom" : "Somme de deux nombres",
   "conv": [],
   "expr": [S,1,2]},
  {"nom" : "Somme d’une lettre et d’un nombre",
   "conv": [],
   "expr": [S,a,1]},
  {"nom" : "Somme d’un nombre et d’une lettre",
   "conv": [],
   "expr": [S,1,a]},
  {"nom" : "Somme de deux lettres",
   "conv": [],
   "expr": [S,a,b]},
  {"nom" : "Diff de deux nombres",
   "conv": [],
   "expr": [D,1,2]},
  {"nom" : "Diff d’une lettre et d’un nombre",
   "conv": [],
   "expr": [D,a,1]},
  {"nom" : "Diff d’un nombre et d’une lettre",
   "conv": [],
   "expr": [D,1,a]},
  {"nom" : "Diff de deux lettres",
   "conv": [],
   "expr": [D,a,b]},
  {"nom" : "Multiple",
   "conv": [],
   "expr": [P,1,a]},
  {"nom" : "Division par un entier",
   "conv": [],
   "expr": [Q,a,1]},
  {"nom" : "Coeff divisé par un entier",
   "conv": [],
   "expr": [Q,1,a]},
  {"nom" : "Carré d’un nombre",
   "conv": [],
   "expr": [C,1]},
  {"nom" : "Carré d’une lettre",
   "conv": [],
   "expr": [C,a]},
  {"nom" : "Puissance 4",
   "conv": [],
   "expr": [Pu,a,4]},
  {"nom" : "Inverse",
   "conv": [],
   "expr": [I,a]},
  {"nom" : "Opposé",
   "conv": [],
   "expr": [O,a]},
  {"nom" : "Produit d’un coeff avec une somme",
   "conv": [P],
   "expr": [P,1,[S,a,2]]},
  {"nom" : "Produit d’un coeff avec une différence",
   "conv": [P],
   "expr": [P,1,[D,a,2]]},
  {"nom" : "Somme d’un coeff avec un produit",
   "conv": [MD,X],
   "expr": [S,1,[P,2,a]]},
  {"nom" : "Différence entre multiple et coeff",
   "conv": [MD,X],
   "expr": [D,[P,1,a],2]},
  {"nom" : "Somme d’un coeff avec un quotient",
   "conv": [MD],
   "expr": [S,1,[Q,a,2]]},
  {"nom" : "Différence entre un opposé et un coeff",
   "conv": [O],
   "expr": [D,[O,a],1]},
  {"nom" : "Opposé d’une différence",
   "conv": [P],
   "expr": [O,[D,a,1]]},
  {"nom" : "Différence entre un coeff et une somme",
   "conv": [P],
   "expr": [D,1,[S,2,a]]},
  {"nom" : "Somme d’une différence avec un coeff",
   "conv": [GD],
   "expr": [S,[D,a,1],2]},
  {"nom" : "Somme divisée par un entier",
   "conv": [F],
   "expr": [Q,[S,a,b],1]},
  {"nom" : "Inverse d’une somme",
   "conv": [F],
   "expr": [I,[S,a,1]]},
  {"nom" : "Multiple divisé par un entier",
   "conv": [X,F],
   "expr": [Q,[P,1,a],2]},
  {"nom" : "Opposé d’un multiple",
   "conv": [MD,X],
   "expr": [O,[P,1,a]]},
  {"nom" : "Homographique séparée",
   "conv": [F,MD],
   "expr": [S,1,[Q,2,[S,[P,3,a],4]]]},
  ];
}();

