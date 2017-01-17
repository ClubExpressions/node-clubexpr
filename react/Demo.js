var ReactDOM = require('react-dom');
var React = require('react');
var Select = require('react-select');

var Expression = require('./Expression');
var ClubExpr = require('../index');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      expressions: ClubExpr.expressions.map(function (exprObj) {
        exprObj.properties = ClubExpr.properties(exprObj.expr);
        return exprObj;
      }),
      expressionsShown: ClubExpr.expressions,
      nature: 'All'
    };
  },
  _onNature: function(natureObj) {
    var nature = natureObj.value;
    var exprs;
    if (nature == 'All') {
      exprs = this.state.expressions;
    } else {
      exprs = this.state.expressions.filter(function (exprObj) {
              return exprObj.properties.nature == nature; });
    }
    this.setState({
      nature: nature,
      expressionsShown: exprs
    });
  },
  render: function() {
    var options = [
        { value: 'All', label: 'Toutes les natures' },
        { value: 'Somme', label: 'Sommes' },
        { value: 'Diff', label: 'Différences' },
        { value: 'Opposé', label: 'Opposés' },
        { value: 'Produit', label: 'Produits' },
        { value: 'Quotient', label: 'Quotients' },
        { value: 'Inverse', label: 'Inverses' },
        { value: 'Carré', label: 'Carrés' },
        { value: 'Racine', label: 'Racines' },
        { value: 'Puissance', label: 'Puissances' }
    ];
    return <div>
    <Select name="form-field-name"
        options={options}
        value={this.state.nature}
        clearable={false}
        onChange={this._onNature}
    />
    <ul>
      {this.state.expressionsShown.map(function(exprObj, idx){
        return <li key={idx}>
                 {(idx<9?"  ":"") + (idx+1)} : <Expression expr={exprObj.expr} />
               </li>;
      })}
    </ul>
    </div>;
  }
});
