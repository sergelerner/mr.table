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
        filterable: [
            {
                name: "fname",
                isRender: false,
                options: [] // {value: String, isChecked: Boolean}
            },
            {
                name: "lname",
                isRender: false,
                options: [] // {value: String, isChecked: Boolean}
            }
        ],
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

    getFilterOptions: function(currentFilter) {
        var name = currentFilter.name;
        var currentOptions = currentFilter.options;

        function capitalize(options) {
            options = options.map(function(option) {
                return option && option[0].toUpperCase() + option.slice(1).toLowerCase();
            }, this);

            return options;
        }

        function removeDuplicates(options) {
            return _.uniq(options);
        }

        var mapValues = [...this.flatMap.values()];
        var newValues = _.pluck(mapValues, name);

        newValues = capitalize(newValues);
        newValues = removeDuplicates(newValues);
        newValues.sort();

        var options = newValues.map(function(value) {
            var idx = _.pluck(currentOptions, "value").indexOf(value);
            if (idx === -1) {
                return {
                    value: value,
                    isChecked: false
                };
            } else {
                return {
                    value: value,
                    isChecked: currentOptions[idx].isChecked
                };
            }
        });

        return options;
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
        var currentFilter = _.findWhere(this.state.filterable, {name: item});
        currentFilter.options = this.getFilterOptions(currentFilter);
        currentFilter.isRender = currentFilter.isRender === true ? false : true;
        this.state.filterable = this.state.filterable.map(function(elm) {
            if (elm.name !== item && elm.isRender === true) {
                elm.isRender = false;
            }
            return elm;
        }, this);

        this.trigger(this.state);
    },

    onToggleCheckbox: function(name, option) {
        var currentFilter = _.findWhere(this.state.filterable, {name: name});
        var currentOption = _.findWhere(currentFilter.options, {value: option});
        currentOption.isChecked = currentOption.isChecked === true ? false : true;

        this.trigger(this.state);
    }

});

module.exports = RequestStore;
