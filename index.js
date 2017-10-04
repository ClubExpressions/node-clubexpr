'use strict'

/**
 * Collection of expressions and utilities for the Club of Expressions :
 *
 * * `parse` : from Lisp source to nested JS arrays
 *
 * @summary Expressions and utilities for the Club of Expressions.
 */

/**
 * Centralization of the list of operations
 *
 */
exports.operations = [
  'Somme',
  'Diff',
  'Produit',
  'Quotient',
  'Opposé',
  'Inverse',
  'Carré',
  'Puissance',
  'Racine'];

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
  return buildTree(tokenize(input));
};

var tokenize = function(input) {
  return input.replace(/\(/g, ' ( ')
              .replace(/\)/g, ' ) ')
              .trim()
              .split(/\s+/);
};

var buildTree = function(input, list, lastToken) {
  if (list === undefined) {
    if (input == "")
      throw new Error("Empty expr");
    if (input[0] !== "(")
      throw new Error("Missing starting (");
    return buildTree(input, []);
  } else {
    var token = input.shift();
    if (token === undefined) {
      if (lastToken !== "(" && lastToken !== ")")
        throw new Error("Missing )");
      var parsed = list.pop();
      if (parsed.length == 1)
        throw new Error("Trailing )");
      return parsed;
    } else if (token === "(") {
      if (input[0] === "(")
        throw new Error("Double (");
      if (input[0] === ")")
        throw new Error("Missing cmd");
      list.push(buildTree(input, [], token));
      return buildTree(input, list, token);
    } else if (token === ")") {
      return buildTree([], [list], token);
    } else {
      return buildTree(input, list.concat(token), token);
    }
  }
};

/**
 * @summary Renders an expression as Lisp source.
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

function twoArgs(op, nbArgs) {
  if (nbArgs < 2) throw new Error(op + ": nb args < 2");
  if (nbArgs > 2) throw new Error(op + ": nb args > 2");
}

function twoOrMoreArgs(op, nbArgs) {
  if (nbArgs < 2) throw new Error(op + ": nb args < 2");
}

/**
 * @summary Renders an expression as LaTex source.
 *
 * @param expr An expression
 * @param parentCmd An optional type of expr, aka command
 * @param pos An optional number, the position in the parent expr (from 0)
 * @return LaTex source
 */
exports.renderExprAsLaTeX = function (expr, parentCmd, pos) {
  if (typeof expr === 'object') {
    var cmd = expr[0];
    var nbArgs = expr.length - 1;
    var args = expr.slice(1).map(function (expr, idx) {
        return exports.renderExprAsLaTeX(expr, cmd, idx);
    });
    var latex = '';
    if (cmd === 'Somme') {
      twoOrMoreArgs('Somme', nbArgs);
      latex = args.join('+');
    }
    if (cmd === 'Diff') {
      twoArgs('Diff', nbArgs);
      latex = args.join('-');
    }
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
    if (latex === '') throw new Error("Unknown cmd:" + cmd);
    if (parens(cmd, parentCmd, pos)) latex = '\\left(' + latex + '\\right)';
    return latex;
  } else {
      return expr;
  }
}

/**
 * @summary Renders Lisp source as LaTeX source.
 *
 * @param src Lisp source, aka Code Club
 * @return LaTeX source
 */
exports.renderLispAsLaTeX = function (src) {
    return exports.renderExprAsLaTeX(exports.parse(src));
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
    if (cmd === 'Opposé' && pos == 0 &&
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
    if (belongsTo(cmd, ['Carré','Puissance']) &&
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
  {"nom" : "Carré de l’inverse",
   "conv": [Pa],
   "expr": [C,[I,a]]},
  {"nom" : "Inverse du carré",
   "conv": [El],
   "expr": [I,[C,a]]},
  {"nom" : "Racine du carré",
   "conv": [],
   "expr": [R,[C,a]]},
  {"nom" : "Racine de la somme de deux carrés",
   "conv": [El],
   "expr": [R,[S,[C,a],[C,b]]]},
  {"nom" : "Produit d’une lettre avec une somme d’un nombre et d’un multiple",
   "conv": [Pa,MD,X],
   "expr": [P,a,[S,1,[P,2,a]]]},
  {"nom" : "Différence entre un multiple et une somme d’un nombre et d’une lettre",
   "conv": [Pa,MD,X],
   "expr": [D,[P,1,a],[S,2,a]]},
  {"nom" : "Différence de multiples",
   "conv": [MD,X],
   "expr": [D,[P,1,a],[P,2,a]]},
  {"nom" : "Différence entre un produit d’une nombre par une différence et un nombre",
   "conv": [Pa,MD,X],
   "expr": [D,[P,1,[D,a,2]],3]},
  {"nom" : "Différence entre un nombre et le produit d’un nombre par une somme",
   "conv": [Pa,MD,X],
   "expr": [D,1,[P,2,[S,a,3]]]},
  {"nom" : "Somme d’une différence entre un multiple et une lettre et un nombre",
   "conv": [GD,MD,X],
   "expr": [S,[D,[P,1,a],a],2]},
  {"nom" : "Somme d’une différence entre une lettre et un quotient et un nombre",
   "conv": [GD,MD],
   "expr": [S,[D,a,[Q,a,1]],2]},
  {"nom" : "Somme d’une différence entre un carré et un multiple et un nombre",
   "conv": [GD,El],
   "expr": [S,[D,[C,a],a],1]},
  {"nom" : "Différence entre le carré d’une somme et un nombre",
   "conv": [Pa,El],
   "expr": [D,[C,[S,a,1]],2]},
  {"nom" : "Produit d’une somme avec une différence",
   "conv": [Pa,X],
   "expr": [P,[S,a,1],[D,a,2]]},
  {"nom" : "Somme de l’opposé d’un carré avec un nombre",
   "conv": [El,Op],
   "expr": [S,[O,[C,a]],1]},
  {"nom" : "Somme d’une multiple de carré et d’un nombre",
   "conv": [El,X],
   "expr": [S,[P,1,[C,a]],a]},
  {"nom" : "Somme d’une différence entre l’opposé d’un nombre et ce nombre, et un entier",
   "conv": [GD,Pa],
   "expr": [S,[D,[O,a],a],1]},
  {"nom" : "Somme d’une différence entre un nombre et son opposé et un entier",
   "conv": [GD,Pa],
   "expr": [S,[D,a,[O,a]],1]},
  {"nom" : "Somme de la différence entre le carré d’un nombre et ce nombre, et un entier",
   "conv": [GD],
   "expr": [S,[D,[C,a],a],1]},
  {"nom" : "Somme de la différence entre un nombre et le double d’une différence entre un nombre et un entier, et un entier",
   "conv": [GD],
   "expr": [S,[D,a,[P,1,[D,a,2]]],3]},
  {"nom" : "Quotient d’une somme et d’une différence",
   "conv": [F],
   "expr": [Q,[S,a,1],[D,a,2]]},
  {"nom" : "Somme d’un nombre et du quotient d’une nombre et d’une somme",
   "conv": [MD,F],
   "expr": [S,1,[Q,2,[S,a,3]]]},
  {"nom" : "Racine d’une somme de carrés de différence et de somme de nombres",
   "conv": [],
   "expr": [R,[S,[C,[D,1,2]],[C,[S,3,4]]]]},
  {"nom" : "Produit d’un nombre et de deux sommes",
   "conv": [],
   "expr": [P,1,[S,2,3],[S,4,5]]},
  {"nom" : "Développement du carré de x+1",
   "conv": [],
   "expr": [S,[C,a],[P,1,a],2]},
  {"nom" : "Différence entre le multiple d’un carré d’une somme et un nombre",
   "conv": [],
   "expr": [D,[P,1,[C,[S,a,2]]],3]},
  {"nom" : "Produit d’un nombre, d’une somme et d’une différence",
   "conv": [],
   "expr": [P,1,[S,2,3],[D,4,5]]},
  {"nom" : "Différence entre le carré d’une somme et un carré",
   "conv": [],
   "expr": [D,[C,[S,a,1]],[C,a]]},
  {"nom" : "Polynôme du second degré avec tous les coefficients",
   "conv": [],
   "expr": [S,[P,1,[C,a]],[P,2,a],3]},
  {"nom" : "Homographique",
   "conv": [],
   "expr": [Q,[S,[P,1,a],2],[S,[P,3,a],4]]},
  {"nom" : "Homographique séparée",
   "conv": [F,MD],
   "expr": [S,1,[Q,2,[S,[P,3,a],4]]]},
  ];
}();

