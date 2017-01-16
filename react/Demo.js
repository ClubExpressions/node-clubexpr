var ReactDOM = require('react-dom');
var React = require('react');

var Expression = require('./Expression');
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
          return <li key={idx}>
                    {idx+1} : <Expression expr={exprObj.expr} />
                 </li>;
        })}
      </ul>
      </div>;
  }
});
