var ReactDOM = require('react-dom');
var React = require('react');

var ClubExpr = require('../index');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      expressions: ClubExpr.expressions
    };
  },
  render: function() {
      return <div>
      <ul>
        {this.state.expressions.map(function(exprObj, idx){
          return <li key={idx}>{ClubExpr.renderExprAsLisp(exprObj.expr)}</li>;
        })}
      </ul>
      </div>;
  }
});
