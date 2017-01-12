(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var clubexpr = require('./index');

// Callback for rendering each expression
function processExpr(exprObj, idx) {
    var randExpr = clubexpr.replaceValuesWith(exprObj.expr, clubexpr.randomNumbers(9));
    var link = '<a href="#e' + (idx+1) + '">' + (idx+1) + '.</a>';
    document.write('<h2 id="e' + (idx+1) + '">' + link + ' ' + exprObj.nom + '</h2>');
    document.write(clubexpr.renderExprAsLisp(randExpr));
    document.write("$$" + clubexpr.renderExprAsLaTeX(randExpr) + "$$");
    if (exprObj.conv.length) {
        document.write("conventions : ");
        document.write(exprObj.conv.join(', '));
    }
    var props = clubexpr.properties(randExpr);
    document.write("<h3>Inspection</h3>");
    document.write("nature: " + props.nature + "<br>");
    document.write(props.nbOps + " operation" + (props.nbOps>1?"(s)":"") + ": " +
                   props.ops.join(', ') + "<br>");
    document.write("unique ops: " + props.uniqueOps.join(', ') + "<br>");
    if (props.conventions.length) {
        document.write("computed conventions : ");
        document.write(props.conventions.join(', '));
        document.write("<br>");
    }
    document.write("depth: " + props.depth + "<br>");
    document.write("leaves: " + props.leaves + "<br>");
    document.write("letters: " + props.letters + "<br>");
    document.write("numbers: " + props.numbers + "<br>");
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

var skipMultSign = function (lastArg, arg) {
    return isNaN(parseInt(arg)) && (!isNaN(parseInt(lastArg)) || arg != lastArg);
}

/**
 * @summary Renders an expression LaTex source.
 *
 * @param expr An expression
 * @param parentCmd An optional type of expr, aka command
 * @param pos An optional number, the position in the parent expr (from 0)
 * @return LaTex source
 */
exports.renderExprAsLaTeX = function (expr, parentCmd, pos) {
  if (typeof expr === 'object') {
    var cmd = expr[0];
    var args = expr.slice(1).map(function (expr, idx) {
        return exports.renderExprAsLaTeX(expr, cmd, idx);
    });
    var latex = '';
    if (cmd === 'Somme'    ) latex = args.join('+');
    if (cmd === 'Diff'     ) latex = args[0] + "-" + args[1];
    if (cmd === 'Produit'  ) {
        var lastArg = args[0];
        latex = args[0];
        for (var i = 1; i < args.length; i++) {
            var arg = args[i];
            if (skipMultSign(lastArg, arg))
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
    if (parens(cmd, parentCmd, pos)) latex = '\\left(' + latex + '\\right)';
    return latex;
  } else {
      return expr;
  }
}

Array.prototype.pushIfAbsent = function(val) {
    if (this.indexOf(val) == -1) this.push(val);
};

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
var parens = function (cmd, parentCmd, pos) {
    var S  = 'Somme';
    var D  = 'Diff';
    var P  = 'Produit';
    var Q  = 'Quotient';
    var O  = 'Opposé';
    var I  = 'Inverse';
    var C  = 'Carré';
    var Pu = 'Puissance';
    var R  = 'Racine';
    if (belongsTo(parentCmd, [C,Pu])) {
        return belongsTo(cmd, [S,D,O,P,Q,I]);
    }
    if (parentCmd == P) {
        return belongsTo(cmd, [S,D,O]);
    }
    if ((parentCmd == O) || (parentCmd == D && pos == 1)) {
        return belongsTo(cmd, [S,D,O]);
    }
    return false;
}

var Properties = function() {
  this.conventions = [];
  this.depth = 0;
  this.leaves = 0;
  this.letters = 0;
  this.numbers = 0;
  this.ops = [];
  this.nbOps = 0;
  this.uniqueOps = [];
  this.nature = '';
}

/**
 * @summary Inspects an expression.
 *
 * @param expr The expression to inspect
 * @param parentCmd An optional type of expr, aka command
 * @param pos An optional number, the position in the parent expr (from 0)
 * @return An object with all the information
 */
exports.properties = function (expr, parentCmd, pos) {
  if (typeof expr === 'object') {
    // Init of the returned object
    var newProps = new Properties();
    // Recursion
    var cmd = expr[0];
    newProps.nature = cmd;
    newProps.ops.push(cmd);
    newProps.nbOps = newProps.nbOps + 1;
    newProps.uniqueOps.pushIfAbsent(cmd);
    var args = expr.slice(1);
    var propsArray = args.map(function (expr, idx) {
      return exports.properties(expr, cmd, idx);
    });
    // Process children
    for (var i = 0; i < propsArray.length; i += 1) {
      var props = propsArray[i];
      newProps.conventions = newProps.conventions.concat(props.conventions);
      if (props.depth > newProps.depth) newProps.depth = props.depth;
      newProps.leaves += props.leaves;
      newProps.letters += props.letters;
      newProps.numbers += props.numbers;
      newProps.ops = newProps.ops.concat(props.ops);
      newProps.nbOps += props.nbOps;
      for (var j = 0; j < props.uniqueOps.length; j += 1) {
        newProps.uniqueOps.pushIfAbsent(props.uniqueOps[j]);
      }
    }
    newProps.depth += 1;
    // Conventions
    // * parenthèses
    if (parens(cmd, parentCmd, pos)) {
        newProps.conventions.push('parenthèses');
    }
    // * signe ×
    if (cmd === 'Produit') {
        var lastArg = args[0];
        for (var i = 1; i < args.length; i++) {
            var arg = args[i];
            if (skipMultSign(lastArg, arg)) {
                newProps.conventions.push('signe ×');
            }
            lastArg = arg;
        }
    }
    // * mult-div
    if (belongsTo(cmd, ['Produit','Quotient','Inverse','Puissance']) &&
        belongsTo(parentCmd, ['Somme', 'Diff', 'Opposé'])) {
        newProps.conventions.push('mult-div');
    }
    // * opposé
    if (cmd === 'Opposé' &&
        belongsTo(parentCmd, ['Somme', 'Diff'])) {
        newProps.conventions.push('opposé');
    }
    // * gauche-droite
    if (belongsTo(cmd, ['Somme','Diff']) &&
        belongsTo(parentCmd, ['Somme'])) {
        newProps.conventions.push('gauche-droite');
    }
    // * fraction
    if (belongsTo(parentCmd, ['Quotient', 'Inverse'])) {
        newProps.conventions.push('fraction');
    }
    // * élévation
    if (belongsTo(cmd, ['Puissance']) &&
        belongsTo(parentCmd, ['Somme', 'Diff', 'Opposé',
                              'Produit', 'Quotient', 'Inverse'])) {
        newProps.conventions.push('élévation');
    }
    // Return
    return newProps;
  } else {
    // A leaf
    var aLetter = isNaN(parseInt(expr));
    var newProps = new Properties();
    newProps.leaves  =  1;
    newProps.letters =  aLetter? 1 : 0;
    newProps.numbers = !aLetter? 1 : 0
    return newProps;
  }
}

/**
 * @summary Builds an expression with specified letters and numbers.
 *
 * @param expr The expression template to use
 * @param obj The elements used to replace the old ones
 */
exports.replaceValuesWith = function (expr, obj) {
  if (typeof expr === 'object') {
    var cmd = expr[0];
    var args = expr.slice(1).map(function (expr) {
      return exports.replaceValuesWith(expr, obj);
    });
    args.unshift(cmd);
    return args;
  } else {
      var newLeaf = obj[expr];
      if (typeof newLeaf !== 'undefined') return newLeaf;
      return expr;
  }
}

/**
 * @summary Builds a random integers array (from 2 to `max`, shuffled).
 *
 * @param max The max integer to include
 * @return The array of integers
 */
exports.randomNumbers = function (max) {
    // http://stackoverflow.com/questions/3895478
    var ints = Array.apply(null, Array(max-1)).map(function (_, i) {return i+2;});
    var counter = ints.length;
    while (counter > 0) {
        var index = Math.floor(Math.random() * counter);
        counter--;
        // swap
        var temp = ints[counter];
        ints[counter] = ints[index];
        ints[index] = temp;
    }
    ints.unshift(0);  // The first number in an expression is 1.
    return ints;
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
  {"nom" : "Différence de deux nombres",
   "conv": [],
   "expr": [D,1,2]},
  {"nom" : "Différence d’une lettre et d’un nombre",
   "conv": [],
   "expr": [D,a,1]},
  {"nom" : "Différence d’un nombre et d’une lettre",
   "conv": [],
   "expr": [D,1,a]},
  {"nom" : "Différence de deux lettres",
   "conv": [],
   "expr": [D,a,b]},
  {"nom" : "Produit de deux nombres",
   "conv": [],
   "expr": [P,1,2]},
  {"nom" : "Multiple",
   "conv": [],
   "expr": [P,1,a]},
  {"nom" : "Produit d’une lettre par un nombre",
   "conv": [],
   "expr": [P,a,1]},
  {"nom" : "Produit de deux lettres",
   "conv": [],
   "expr": [P,a,b]},
  {"nom" : "Produit de deux lettres identiques",
   "conv": [],
   "expr": [P,a,a]},
  {"nom" : "Quotient de nombres",
   "conv": [],
   "expr": [Q,1,2]},
  {"nom" : "Lettre divisée par un nombre",
   "conv": [],
   "expr": [Q,a,1]},
  {"nom" : "Nombre divisé par une lettre",
   "conv": [],
   "expr": [Q,1,a]},
  {"nom" : "Quotient de lettres",
   "conv": [],
   "expr": [Q,a,b]},
  {"nom" : "Carré d’un nombre",
   "conv": [],
   "expr": [C,1]},
  {"nom" : "Carré d’une lettre",
   "conv": [],
   "expr": [C,a]},
  {"nom" : "Puissance",
   "conv": [],
   "expr": [Pu,a,1]},
  {"nom" : "Inverse",
   "conv": [],
   "expr": [I,a]},
  {"nom" : "Opposé",
   "conv": [],
   "expr": [O,a]},
  {"nom" : "Produit d’un nombre avec une somme",
   "conv": [Pa],
   "expr": [P,1,[S,a,2]]},
  {"nom" : "Produit d’un nombre avec une différence",
   "conv": [Pa],
   "expr": [P,1,[D,a,2]]},
  {"nom" : "Somme d’un nombre avec un produit",
   "conv": [MD,X],
   "expr": [S,1,[P,2,a]]},
  {"nom" : "Différence entre un nombre et un opposé",
   "conv": [Pa],
   "expr": [D,1,[O,2]]},
  {"nom" : "Différence entre multiple et nombre",
   "conv": [MD,X],
   "expr": [D,[P,1,a],2]},
  {"nom" : "Somme d’un nombre avec un quotient",
   "conv": [MD],
   "expr": [S,1,[Q,a,2]]},
  {"nom" : "Différence entre un opposé et un nombre",
   "conv": [Op],
   "expr": [D,[O,a],1]},
  {"nom" : "Opposé d’une différence",
   "conv": [Pa],
   "expr": [O,[D,a,1]]},
  {"nom" : "Différence entre un nombre et une somme",
   "conv": [Pa],
   "expr": [D,1,[S,2,a]]},
  {"nom" : "Somme d’une différence avec un nombre",
   "conv": [GD],
   "expr": [S,[D,a,1],2]},
  {"nom" : "Somme divisée par un nombre",
   "conv": [F],
   "expr": [Q,[S,a,b],1]},
  {"nom" : "Inverse d’une somme",
   "conv": [F],
   "expr": [I,[S,a,1]]},
  {"nom" : "Multiple divisé par un nombre",
   "conv": [X,F],
   "expr": [Q,[P,1,a],2]},
  {"nom" : "Opposé d’un multiple",
   "conv": [MD,X],
   "expr": [O,[P,1,a]]},
  {"nom" : "Opposé de l’inverse",
   "conv": [MD],
   "expr": [O,[I,a]]},
  {"nom" : "Opposé d’un quotient de deux lettres",
   "conv": [MD],
   "expr": [O,[Q,a,b]]},
  {"nom" : "Opposé d’un carré",
   "conv": [El],
   "expr": [O,[C,a]]},
  {"nom" : "Carré d’un opposé",
   "conv": [],
   "expr": [C,[O,a]]},
  {"nom" : "Carré d’une somme",
   "conv": [Pa],
   "expr": [C,[S,1,a]]},
  {"nom" : "Somme d’un nombre avec un carré",
   "conv": [El],
   "expr": [S,1,[C,a]]},
  {"nom" : "Multiple d’un carré",
   "conv": [El,X],
   "expr": [P,1,[C,a]]},
  {"nom" : "Carré d’un multiple",
   "conv": [Pa,X],
   "expr": [C,[P,1,a]]},
  {"nom" : "Carré divisé par un nombre",
   "conv": [El],
   "expr": [Q,[C,a],1]},
  {"nom" : "Carré d’une lettre divisée par un nombre",
   "conv": [Pa],
   "expr": [C,[Q,a,1]]},
  {"nom" : "Produit d’une lettre par un multiple d’une lettre",
   "conv": [X],
   "expr": [P,a,[P,1,a]]},
  {"nom" : "Homographique séparée",
   "conv": [F,MD],
   "expr": [S,1,[Q,2,[S,[P,3,a],4]]]},
  ];
}();


},{}]},{},[1]);
