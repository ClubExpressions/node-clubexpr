(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var clubexpr = require('./index');

// Callback for rendering each expression
function processExpr(exprObj, idx) {
    var link = '<a href="#e' + (idx+1) + '">' + (idx+1) + '.</a>';
    document.write('<h2 id="e' + (idx+1) + '">' + link + ' ' + exprObj.nom + '</h2>');
    document.write(clubexpr.renderExprAsLisp(exprObj.expr));
    document.write("$$" + clubexpr.renderExprAsLaTeX(exprObj.expr) + "$$");
    if (exprObj.conv.length) {
        document.write("  conventions : ");
        document.write(exprObj.conv.join(', '));
    }
}

clubexpr.expressions.forEach(processExpr);


},{"./index":2}],2:[function(require,module,exports){
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

/**
 * @summary Renders an expression LaTex source.
 *
 * @param expr An expression
 * @param parentCmd An optional type of expr, aka command
 * @return LaTex source
 */
exports.renderExprAsLaTeX = function (expr, parentCmd) {
  if (typeof expr === 'object') {
    var cmd = expr[0];
    var args = expr.slice(1).map(function (expr) {
        return exports.renderExprAsLaTeX(expr, cmd);
    });
    var latex = '';
    if (cmd === 'Somme'    ) latex = args.join('+');
    if (cmd === 'Diff'     ) latex = args[0] + "-" + args[1];
    if (cmd === 'Produit'  ) {
        var lastArg = args[0];
        latex = args[0];
        for (var i = 1; i < args.length; i++) {
            var arg = args[i];
            if (!isNaN(parseInt(lastArg)) && isNaN(parseInt(arg)))
                latex = latex + arg;
            else
                latex = latex + '×' + arg;
            lastArg = arg;
        }
    }
    if (cmd === 'Quotient' ) latex = "\\frac{" + args[0] + "}{" + args[1] + "}";
    if (cmd === 'Opposé'   ) latex = "-" + args[0];
    if (cmd === 'Inverse'  ) latex = "\\frac{1}{" + args[0] + "}";
    if (cmd === 'Carré'    ) latex = args[0] + "^2";
    if (cmd === 'Puissance') latex = args[0] + "^" + args[1];
    if (cmd === 'Racine'   ) latex = "\\sqrt{" + args[0] + "}";
    if (latex === '') return "Unknown cmd: " + cmd;
    if (parens(cmd, parentCmd)) latex = '\\left(' + latex + '\\right)';
    return latex;
  } else {
      return expr;
  }
}

/**
 * @summary Tests if a value is in an array.
 *
 * @param obj The value
 * @param arr The array
 * @return a boolean
 */
var belongsTo = function (obj, arr) {
    return arr.indexOf(obj) !== -1;
}

/**
 * @summary Tests if the sub-expr should be surrounded with parens.
 *
 * @param cmd The current type of expr, aka command
 * @param parentCmd The parent command
 * @return a boolean
 */
var parens = function (cmd, parentCmd) {
    var S  = 'Somme';
    var D  = 'Diff';
    var P  = 'Produit';
    var Q  = 'Quotient';
    var O  = 'Opposé';
    var I  = 'Inverse';
    var C  = 'Carré';
    var Pu = 'Puissance';
    var R  = 'Racine';
    if (belongsTo(cmd, [S,D])) {
        return belongsTo(parentCmd, [D,P,O,C,Pu,R]);
    }
    if (belongsTo(cmd, [P,Q,O,I])) {
        return belongsTo(parentCmd, [C,Pu]);
    }
    return false;
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
  {"nom" : "Différence entre produit et coeff",
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


},{}]},{},[1]);