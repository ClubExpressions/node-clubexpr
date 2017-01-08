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
    var props = clubexpr.properties(exprObj.expr);
    document.write("<h3>Inspection</h3>");
    document.write("depth: " + props.depth + "<br>");
    document.write("leaves: " + props.leaves + "<br>");
    document.write("letters: " + props.letters + "<br>");
    document.write("numbers: " + props.numbers + "<br>");
}

clubexpr.expressions.forEach(processExpr);

