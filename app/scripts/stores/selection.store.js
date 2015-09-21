var Reflux    = require("reflux");
var Actions   = require("../actions/actions");
var _         = require("lodash");

var SelectionStore = Reflux.createStore({

    state: {
       selection: []
    },

    listenables: [Actions],

    init: function() {
        
    },

    onClearAndSelect: function(itemsArray) {        
        this.state.selection = [];    
        this.state.selection = _.union(this.state.selection, itemsArray);            
        this.trigger(this.state.selection);
    },

    onSelect: function(itemsArray) {        
        this.state.selection = _.union(this.state.selection, itemsArray);        
        this.trigger(this.state.selection);
    },

    onDeselect: function(itemsArray) {        
        this.state.selection = _.filter(this.state.selection, function(item) {
            return item.id !== itemsArray[0].id;
        });        
        this.trigger(this.state.selection);
    },

    onDeselectAll: function() {        
        this.state.selection = [];        
        this.trigger(this.state.selection);
    }
    
});

module.exports = SelectionStore;
