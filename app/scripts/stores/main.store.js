var Reflux         = require("reflux");
var Backend        = require("../backend.js");
var SelectionStore = require("./selection.store");
var Actions        = require("../actions/actions");
var _              = require("lodash");

var RequestStore = Reflux.createStore({

    number: 10,

    flatMap: null,

    currentSorted: null,

    state: {
        isRender: true,
        isWaiting: true,
        tableData: {},
        sortable: ["fname", "lname"],
        filterable: ["fname", "lname"],
        sortArrow: {
            item: null,
            direction: null
        },
        filterWindow: {
            item: null,
            options: []
        }
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

        var omitFromTable = ["isSelected"]; // ["id", "isSelected"];

        headers = _.keys(_.omit(mapValues[0], omitFromTable));

        rows = mapValues.map(function(item, index) {
            var metadata = _.pick(item, ["id", "isSelected"]);
            var rowdata  = _.omit(item, omitFromTable);
            var row      = _.merge(metadata, {row: _.values(rowdata)});
            return row;
        });

        return {
            headers: headers,
            rows: rows
        }
    },

    sortMap: function(map, sortBy, currentSorted) {
        var isAlreadySorted = this.currentSorted === sortBy ? true : false;
        var sortDirection   = isAlreadySorted ? "desc" : "asc";
        var mapValues       = [...map.values()];
        var mapKeys         = [...map.keys()];
        var mapValuesSorted = _.sortByOrder(mapValues, sortBy, sortDirection);

        return new Map(mapValuesSorted.map(function(item, index) {
            return [item.id, item]
        }));
    },

    handleSelection: function(selectionArray, flatMap) {

        for (let [key, value] of flatMap) {
            value.isSelected = false;
        }

        if (selectionArray.length === 0) return flatMap;

        selectionArray.forEach(function(item) {
            var current        = flatMap.get(item.id);
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

    getFilterOptions: function(item) {
        function removeDuplicates(filterOptions) {
            return filterOptions;
        }

        function capitalize(filterOptions) {
            return filterOptions;
        }

        var mapValues = [...this.flatMap.values()];
        var filterOptions = _.pluck(mapValues, item);

        filterOptions = removeDuplicates(filterOptions);
        filterOptions = capitalize(filterOptions);


        return  filterOptions;
    },

    onClickOnCell: function(item) {
        console.log("clickOnCell", item);
    },

    onSort: function(sortBy) {
        // TODO: toggle sort
        var flatMap   = this.sortMap(this.flatMap, sortBy, this.currentSorted);
        this.currentSorted = this.currentSorted === sortBy ? null : sortBy;
        this.state.sortArrow.item = sortBy;
        this.state.sortArrow.direction = this.currentSorted ? "down" : "up";
        var tableData = this.createTableData(flatMap);

        this.flatMap         = flatMap;
        this.state.tableData = tableData;

        this.trigger(this.state);
    },

    onToggleFilter: function(item) {
        this.currentFilter = this.currentFilter === item ? null : item;
        this.state.filterWindow.item = this.currentFilter;
        this.state.filterWindow.options = this.getFilterOptions(item);
        this.trigger(this.state);
    }

});

module.exports = RequestStore;
