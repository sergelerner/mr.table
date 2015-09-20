var Reflux    = require("reflux");

var Actions = Reflux.createActions({
	"select"         : {},
	"deselect"       : {},
	"deselectAll"    : {},
	"clickOnCell"    : {},
	"sort"           : {}
});


module.exports = Actions;
