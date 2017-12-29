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

var allowedChars = " ()\n\t" +
                   "01234567789" +
                   "abcdefghijklmnopqrstuvwxyz" +
                   "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                   "é";

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
  input.split('').map(function (token) {
    if (allowedChars.indexOf(token) == -1)
      throw new Error("Invalid char: " + token);
  });
  var tokenized = tokenize(input);
  var warnings = [];
  if (tokenized.length == 1) {
    if (tokenized[0] == "")
      throw new Error("Empty expr");
    if (tokenized[0] == "(")
      throw new Error("Missing cmd");
  }
  if (tokenized[0] !== "(")
    throw new Error("Missing starting (");
  if (tokenized[tokenized.length - 1] == "(") {
    warnings.pushIfAbsent("Missing cmd");
  }
  var result = buildTree(tokenized);
  return {tree: result.tree,
          warnings: warnings.concatIfAbsent(result.warnings)};
};

var tokenize = function(input) {
  return input.replace(/\(/g, ' ( ')
              .replace(/\)/g, ' ) ')
              .trim()
              .split(/\s+/);
};

var buildTree = function(input, list, warnings, openParens) {
  if (list === undefined) {  // initial call, input is the only defined arg
    return buildTree(input, [], [], 0);
  } else {  // internal calls, list in undefined
    var token = input.shift();
    if (token === "closing )") {
      return {tree: list.pop(), warnings: warnings};
    } else if (token === undefined) {
      if (openParens > 0) {
        warnings.pushIfAbsent("Missing )");
        return {tree: list, warnings: warnings};
      }
      return {tree: list.pop(), warnings: warnings};
    } else if (openParens == 0 && list.length > 0) {
      warnings.pushIfAbsent("Already closed");
      return {tree: list.pop(), warnings: warnings};
    } else if (token === "(") {
      if (input[0] === "(")
        throw new Error("Double (");
      if (input[0] === ")")
        throw new Error("Missing cmd");
      var result1 = buildTree(input, [], [], openParens + 1);
      if (result1.tree.length > 0) list.push(result1.tree);
      var result2 = buildTree(input, list, warnings, openParens);
      return {tree: result2.tree,
              warnings: warnings.concatIfAbsent(result1.warnings,
                                                           result2.warnings)};
    } else if (token === ")") {
      var result = buildTree(["closing )"], [list], warnings, openParens - 1);
      return {tree: result.tree,
              warnings: warnings.concatIfAbsent(result.warnings)};
    } else {
      var result = buildTree(input, list.concat(token), warnings, openParens);
      return {tree: result.tree,
              warnings: warnings.concatIfAbsent(result.warnings)};
    }
  }
};

/**
 * @summary Extracts the nature of an expression as Lisp source.
 *
 * @param src Lisp source, aka Code Club
 * @return nature The nature of the expr, or the empty string
 */
exports.natureFromLisp = function (src) {
    var toReturn = '';
    src = src.trim();
    if (src[0] === '(') src = src.slice(1);
    src = src.trim();
    src = src.split(' ')[0];
    src = src.split('(')[0];
    exports.operations.forEach(function (operation) {
        if (src == operation) toReturn = operation;
    });
    return toReturn;
}

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

var skipMultSign = function (prevArg, arg) {
    return isNaN(parseInt(arg)) && (!isNaN(parseInt(prevArg)) || arg != prevArg);
}

function oneArg(op, nbArgs) {
  if (nbArgs < 1) throw new Error(op + ": nb args < 1");
  if (nbArgs > 1) throw new Error(op + ": nb args > 1");
}

function twoArgs(op, nbArgs) {
  if (nbArgs < 2) throw new Error(op + ": nb args < 2");
  if (nbArgs > 2) throw new Error(op + ": nb args > 2");
}

function twoOrMoreArgs(op, nbArgs) {
  if (nbArgs < 2) throw new Error(op + ": nb args < 2");
}

var numRegex = /^[-]?\d+([\.,]\d+)?$/;
var greekLetters = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon',
                    'zeta', 'eta', 'theta', 'vartheta', 'iota', 'kappa',
                    'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'varrho', 'sigma',
                    'tau', 'upsilon', 'phi', 'varphi', 'chi', 'psi', 'omega',
                    'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma',
                    'Upsilon', 'Phi', 'Psi', 'Omega'];

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
    var args = [];
    var warnings = [];
    for (var i = 1; i <= nbArgs; i++) {
      var result = exports.renderExprAsLaTeX(expr[i], cmd, i-1);
      args.push(result.latex);
      warnings.concatIfAbsent(result.warnings);
    }
    var latex = '';
    if (cmd === 'Somme') {
      twoOrMoreArgs('Somme', nbArgs);
      latex = args.join('+');
    } else if (cmd === 'Diff') {
      twoArgs('Diff', nbArgs);
      latex = args.join('-');
    } else if (cmd === 'Produit') {
      twoOrMoreArgs('Produit', nbArgs);
      var prevArg = args[0];
      latex = args[0];
      for (var i = 1; i < args.length; i++) {
          var arg = args[i];
          if (skipMultSign(prevArg, arg))
              latex = latex + ' ' + arg;
          else
              latex = latex + ' \\times ' + arg;
          prevArg = arg;
      }
    } else if (cmd === 'Quotient') {
      twoArgs('Quotient', nbArgs);
      latex = "\\frac{" + args[0] + "}{" + args[1] + "}";
    } else if (cmd === 'Opposé') {
      oneArg('Opposé', nbArgs);
      latex = "-" + args[0];
    } else if (cmd === 'Inverse') {
      oneArg('Inverse', nbArgs);
      latex = "\\frac{1}{" + args[0] + "}";
    } else if (cmd === 'Carré') {
      oneArg('Carré', nbArgs);
      // curly brackets for same code than with Puissance
      latex = "{" + args[0] + "}^{2}";
    } else if (cmd === 'Puissance') {
      twoArgs('Puissance', nbArgs);
      latex = "{" + args[0] + "}^{" + args[1] + "}";
    } else if (cmd === 'Racine') {
      oneArg('Racine', nbArgs);
      latex = "\\sqrt{" + args[0] + "}";
    }
    if (latex === '') throw new Error("Unknown cmd: " + cmd);
    if (parens(cmd, parentCmd, pos)) latex = '\\left(' + latex + '\\right)';
    return {latex: latex, warnings: []};
  } else {
    if (numRegex.test(expr)) {
      // number
      return {latex: expr, warnings: []};
    } else if (expr.length == 1) {
      // single letter
      return {latex: expr, warnings: []};
    } else if (greekLetters.indexOf(expr) >= 0) {
      // greek letter
      return {latex: "\\" + expr, warnings: []};
    } else {
      throw new Error("Bad leaf: " + expr);
    }
  }
}

/**
 * @summary Renders Lisp source as LaTeX source.
 *
 * @param src Lisp source, aka Code Club
 * @return LaTeX source
 */
exports.renderLispAsLaTeX = function (src) {
    var parseResult = exports.parse(src);
    var latexResult = exports.renderExprAsLaTeX(parseResult.tree);
    return {latex: latexResult.latex,
            warnings: parseResult.warnings.concatIfAbsent(latexResult.warnings)};
}

Array.prototype.pushIfAbsent = function(val) {
    if (this.indexOf(val) == -1) this.push(val);
};

Array.prototype.concatIfAbsent = function(val) {
    for (var i = 0; i < val.length; i += 1) {
        if (val[i] == "Already closed") return ["Already closed"];
        if (this.indexOf(val[i]) == -1) this.push(val[i]);
    }
    return this;
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
 * @pos Position in the list of args, starting with 0
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
    if (belongsTo(parentCmd, [C,Pu]) && pos == 0) {
        return belongsTo(cmd, [S,D,O,P,Q,I,C,Pu]);
    }
    if (parentCmd == P) {
        return belongsTo(cmd, [S,D,O]);
    }
    if ((parentCmd == O) || (parentCmd == D && pos == 1)) {
        return belongsTo(cmd, [S,D,O]);
    }
    if (parentCmd == S && cmd == O && pos == 1) {
        return true;
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
        var prevArg = args[0];
        for (var i = 1; i < args.length; i++) {
            var arg = args[i];
            if (skipMultSign(prevArg, arg)) {
                newProps.conventions.push('signe ×');
            }
            prevArg = arg;
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
  {"nom" : "Somme entre un nombre et l’opposé d’un nombre",
   "conv": [Pa],
   "expr": [S,1,[O,2]]},
  {"nom" : "Somme entre un nombre et l’opposé d’une lettre",
   "conv": [Pa],
   "expr": [S,1,[O,a]]},
  {"nom" : "Différence entre un nombre et l’opposé d’un nombre",
   "conv": [Pa],
   "expr": [D,1,[O,2]]},
  {"nom" : "Différence entre un nombre et l’opposé d’une lettre",
   "conv": [Pa],
   "expr": [D,1,[O,a]]},
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
  {"nom" : "Nombre à la puissance d’une somme",
   "conv": [],
   "expr": [Pu,a,[S,b,c]]},
  {"nom" : "Lettre à la puissance (une lettre à la puissance d’une lettre)",
   "conv": [],
   "expr": [Pu,a,[Pu,b,c]]},
  {"nom" : "Lettre à la puissance d’une lettre, à la puissance d’une lettre",
   "conv": [],
   "expr": [Pu,[Pu,a,b],c]},
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
  {"nom" : "Carré d’une somme d’un nombre et d’une lettre",
   "conv": [Pa],
   "expr": [C,[S,1,a]]},
  {"nom" : "Carré d’une somme de lettres",
   "conv": [Pa],
   "expr": [C,[S,a,b]]},
  {"nom" : "Carré d’une différence de lettres",
   "conv": [Pa],
   "expr": [C,[D,a,b]]},
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
  {"nom" : "Somme de deux carrés",
   "conv": [El],
   "expr": [S,[C,a],[C,b]]},
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

