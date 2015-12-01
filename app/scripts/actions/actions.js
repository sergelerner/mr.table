var Reflux    = require("reflux");

var Actions = Reflux.createActions({
	"select"         : {},
	"deselect"       : {},
	"deselectAll"    : {},
	"clearAndSelect" : {},
	"clickOnCell"    : {},
	"sort"           : {},
	"toggleFilter"   : {}
});


Actions.select.preEmit = function(data) {
    console.log("%c SELECT -------------------------------------------------", "background: lightgreen", data);
}

Actions.deselect.preEmit = function(data) {
    console.log("%c DESELECT -------------------------------------------------", "background: lightgreen", data);
}

Actions.deselectAll.preEmit = function(data) {
    console.log("%c DESELECT ALL -------------------------------------------------", "background: lightgreen", data);
}

module.exports = Actions;
