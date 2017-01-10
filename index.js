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

/**
 * @summary Inspects an expression.
 *
 * @param expr The expression to inspect
 * @param parentCmd An optional type of expr, aka command
 * @return An object with all the information
 */
exports.properties = function (expr, parentCmd) {
  if (typeof expr === 'object') {
    // Init of the returned object
    var newProps = {
      conventions: [],
      depth: 0,
      leaves: 0,
      letters: 0,
      numbers: 0,
      nature: ''
    };
    // Recursion
    var cmd = expr[0];
    newProps.nature = cmd;
    var args = expr.slice(1);
    var propsArray = args.map(function (expr) {
      return exports.properties(expr, cmd);
    });
    // Process children
    for (var i = 0; i < propsArray.length; i += 1) {
      var props = propsArray[i];
      newProps.conventions = newProps.conventions.concat(props.conventions);
      if (props.depth > newProps.depth) newProps.depth = props.depth;
      newProps.leaves += props.leaves;
      newProps.letters += props.letters;
      newProps.numbers += props.numbers;
    }
    newProps.depth += 1;
    // Conventions
    // * parenthèses
    if (parens(cmd, parentCmd)) {
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
    if (belongsTo(cmd, ['Produit','Quotient','Puissance']) &&
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
    // Return
    return newProps;
  } else {
    // A leaf
    var aLetter = isNaN(parseInt(expr));
    return {
      conventions: [],
      depth: 0,
      leaves: 1,
      letters:  aLetter? 1 : 0,
      numbers: !aLetter? 1 : 0,
      nature: ''
    };
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
  {"nom" : "Division par un nombre",
   "conv": [],
   "expr": [Q,a,1]},
  {"nom" : "Coeff divisé par un nombre",
   "conv": [],
   "expr": [Q,1,a]},
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
  {"nom" : "Homographique séparée",
   "conv": [F,MD],
   "expr": [S,1,[Q,2,[S,[P,3,a],4]]]},
  ];
}();

