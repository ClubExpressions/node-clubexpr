var ReactDOM = require('react-dom');
var React = require('react');
var Select = require('react-select');
var Slider = require('rc-slider');

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
      nature: 'All',
      depthRange: [1, 7]
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
  _onDepth: function(depthRange) {
      console.log(depthRange);
    var min = depthRange[0];
    var max = depthRange[1];
    this.setState({
      depthRange: depthRange,
      expressionsShown: this.state.expressions.filter(function (exprObj) {
          var exprDepth = exprObj.properties.depth;
          return min <= exprDepth && exprDepth <= max; })
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
    <Select
        options={options}
        value={this.state.nature}
        clearable={false}
        onChange={this._onNature}
    />
    Profondeur 
    <Slider
        min={1} max={7} range={true}
        value={this.state.depthRange}
        onChange={this._onDepth}
        marks={{'1':'1', '2':'2', '3':'3', '4':'4', '5':'5', '6':'6', '7':'7'}}
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
