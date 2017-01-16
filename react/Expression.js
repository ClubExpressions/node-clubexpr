var React = require('react');
var MathJax = require('react-mathjax');


var ClubExpr = require('../index');

module.exports = React.createClass({
  render: function() {
    return <span>
    <MathJax.Context>
      <MathJax.Node inline>{ClubExpr.renderExprAsLaTeX(this.props.expr)}</MathJax.Node>
    </MathJax.Context>
    </span>;
  }
});
