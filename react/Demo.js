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
      filters: {},
      nature: 'All',
      depthRange: [1, 7],
      nbOpsRange: [1, 7]
    };
  },
  _filter: function(expr) {
    var bool = true;
    var filters = this.state.filters;
    Object.keys(filters).forEach(function (key) {
      if (!filters[key](expr)) {
        bool = false;
        return false;  // Stop the loop!
      }
    });
    return bool;
  },
  _onNature: function(natureObj) {
    var nature = natureObj.value;
    var filters = this.state.filters;
    if (nature == 'All') {
      delete filters.nature;
    } else {
      filters.nature = function (exprObj) {
        return exprObj.properties.nature == nature;
      };
    }
    this.setState({
      nature: nature,
      filters: filters
    });
  },
  _onDepth: function(depthRange) {
    var min = depthRange[0];
    var max = depthRange[1];
    var filters = this.state.filters;
    filters.depth = function (exprObj) {
          var exprDepth = exprObj.properties.depth;
          return min <= exprDepth && exprDepth <= max;
    };
    this.setState({
      depthRange: depthRange,
      filters: filters
    });
  },
  _onNbOps: function(nbOpsRange) {
    var min = nbOpsRange[0];
    var max = nbOpsRange[1];
    var filters = this.state.filters;
    filters.nbOps = function (exprObj) {
          var exprNbOps = exprObj.properties.nbOps;
          return min <= exprNbOps && exprNbOps <= max;
    };
    this.setState({
      nbOpsRange: nbOpsRange,
      filters: filters
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
    Nbre d’opérations
    <Slider
        min={1} max={7} range={true}
        value={this.state.nbOpsRange}
        onChange={this._onNbOps}
        marks={{'1':'1', '2':'2', '3':'3', '4':'4', '5':'5', '6':'6', '7':'7'}}
    />
    <ul>
      {this.state.expressions.filter(this._filter).map(function(exprObj, idx){
        return <li key={idx}>
                 {(idx<9?"  ":"") + (idx+1)} : <Expression expr={exprObj.expr} />
               </li>;
      })}
    </ul>
    </div>;
  }
});
