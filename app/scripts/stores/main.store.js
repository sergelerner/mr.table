var Reflux         = require("reflux");
var Backend        = require("../backend.js");
var SelectionStore = require("./selection.store");
var Actions        = require("../actions/actions");
var _              = require("lodash");

var RequestStore = Reflux.createStore({

    number: 800,

    flatMap: null,

    state: {
        isRender: true,
        isWaiting: true        
    },

    listenables: [Actions],

    init: function() {

        this.listenTo(SelectionStore, this.listenSelectionStore);

        console.time("getRandomData");                

        var dummyData  = Backend.getRandomData(this.number);
        var tableData  = null;

        if (Promise.resolve(dummyData) === dummyData) {

            dummyData
                .then(function(collection) { 
                    console.timeEnd("getRandomData");  
                    console.log("AJAX", this.number, " Items"); 
                    var flatMap   = this.flatMap(collection);
                    var tableData = this.createTableData(flatMap);  
                    
                    this.flatMap         = flatMap;
                    this.state.isWaiting = false;
                    this.state.tableData = tableData; 

                    this.trigger(this.state);
                }.bind(this));
        }        
    },

    flatMap: function(collection) {
        
        function _extendItam(obj) {
            return _.merge(obj, {
                isSelected: false
            });
        }

        return _.indexBy(_.map(collection, _extendItam), "id");
    },

    createTableData: function(flatMap) {

        var headers = [];
        var rows    = [];

        for (var id in flatMap) { 
            headers = _.keys(_.omit(flatMap[id], "id", "isSelected"));
            break;
        }

        for (var id in flatMap) {

            var item     = flatMap[id];

            var metadata = _.pick(item, "id", "isSelected");
            var reldata  = _.omit(item, "id", "isSelected");            
            var row      = _.merge(metadata, {row: _.values(reldata)});

            rows.push(row);
        }

        return {
            headers: headers,
            rows: rows
        }
    },

    getInitialState: function() {
        return this.state;
    },

    handleSelection: function(selectionArray, flatMap) {        

        _.forOwn(flatMap, function(value, key) {
            value.isSelected = false;
        });

        if (selectionArray.length === 0) return flatMap;

        selectionArray.forEach(function(item) {
            flatMap[item.id].isSelected = !item.isSelected;
        }, this);        

        return flatMap;
    },

    ////////////////////////////////////////////////////////////
    
    listenSelectionStore: function(selectionArray) { 

        console.log("%c on select", "background: tomato");
        
        console.time("handleSelection");        
        var flatMap   = this.handleSelection(selectionArray, this.flatMap);
        console.timeEnd("handleSelection");

        console.time("createTableData");        
        var tableData = this.createTableData(flatMap); 
        console.timeEnd("createTableData");

        this.flatMap         = flatMap;   
        this.state.tableData = tableData;   
        this.trigger(this.state);        
    },

    clickOnCell: function(item) {
        console.log("clickOnCell", item);
    }

});

module.exports = RequestStore;
