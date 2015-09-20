var Reflux         = require("reflux");
var Backend        = require("../backend.js");
var SelectionStore = require("./selection.store");
var Actions        = require("../actions/actions");
var _              = require("lodash");

var RequestStore = Reflux.createStore({

    number: 10,

    flatMap: null,

    state: {
        isRender: true,
        isWaiting: true,
        tableData: {}        
    },

    listenables: [Actions],

    getInitialState: function() {
        return this.state;
    },

    init: function() {

        this.listenTo(SelectionStore, this.listenSelectionStore);            

        var dummyData  = Backend.getRandomData(this.number);
        var tableData  = null;

        if (Promise.resolve(dummyData) === dummyData) {

            dummyData
                .then(function(collection) {                     

                    var flatMap   = this.createMap(collection);
                    var tableData = this.createTableData(flatMap);  

                    this.flatMap         = flatMap;
                    this.state.isWaiting = false;
                    this.state.tableData = tableData; 

                    console.log("state", this.state);

                    this.trigger(this.state);

                }.bind(this));
        }        
    },

    createMap: function(collection) {

        var extendWith = {
            isSelected: false
        }

        function _extendItam(obj) {
            return _.merge(obj, extendWith);
        }

        return new Map(collection.map(function(item, index) {
            return [item.id, _.merge(item, extendWith)];
        }));
    },

    createTableData: function(map) {

        var mapValues   = [...map.values()];
        var headers     = [];
        var rows        = [];

        headers = _.keys(_.omit(mapValues[0], "id", "isSelected"));

        rows = mapValues.map(function(item, index) {
            var metadata = _.pick(item, "id", "isSelected");
            var reldata  = _.omit(item, "id", "isSelected");            
            var row      = _.merge(metadata, {row: _.values(reldata)});
            return row;
        });

        return {
            headers: headers,
            rows: rows
        }
    },    

    sortMap: function(map, sortBy) {
        var mapValues       = [...map.values()];
        var mapKeys         = [...map.keys()];
        var mapValuesSorted = _.sortBy(mapValues, sortBy);

        return new Map(mapValuesSorted.map(function(item, index) {
            return [mapKeys[index], item]
        }));
    },

    handleSelection: function(selectionArray, flatMap) {

        _.forOwn(flatMap, function(value, key) {
            value.isSelected = false;
        });

        if (selectionArray.length === 0) return flatMap;

        selectionArray.forEach(function(item) {             
            let current        = flatMap.get(item.id);            
            current.isSelected = !item.isSelected;
            flatMap.set(item.id, current);            
        }, this);        

        return flatMap;
    },

    ////////////////////////////////////////////////////////////
    
    listenSelectionStore: function(selectionArray) {    
        var flatMap   = this.handleSelection(selectionArray, this.flatMap);     
        var tableData = this.createTableData(flatMap); 

        this.flatMap         = flatMap;   
        this.state.tableData = tableData;   
        this.trigger(this.state);        
    },

    onClickOnCell: function(item) {
        console.log("clickOnCell", item);
    },

    onSort: function(sortBy) {
        var flatMap   = this.sortMap(this.flatMap, sortBy);        
        var tableData = this.createTableData(flatMap);   

        this.flatMap         = flatMap;
        this.state.tableData = tableData;   

        this.trigger(this.state);
    }

});

module.exports = RequestStore;
