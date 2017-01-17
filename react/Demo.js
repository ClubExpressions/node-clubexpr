var ReactDOM = require('react-dom');
var React = require('react');
var Select = require('react-select');

var Expression = require('./Expression');
var ClubExpr = require('../index');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      expressions: ClubExpr.expressions
    };
  },
  _onNature: function() {
      console.log('nature');
  },
  render: function() {
      var options = [
          { value: 'All', label: 'Nature indifférente' },
          { value: 'Somme', label: 'Sommes' },
          { value: 'Produit', label: 'Produits' }
      ];
      return <div>
      <Select name="form-field-name" value="All" options={options}
              onChange={this._onNature}
      />
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
