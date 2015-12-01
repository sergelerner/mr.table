var React     = require("react");
var Reflux    = require("reflux");
var Actions   = require("../actions/actions");
var MainStore = require("../stores/main.store.js");

var Main = React.createClass({

	mixins: [Reflux.listenTo(MainStore, "onChangeCallback", "initialCallback")],

    onChangeCallback: function(data) {
       this.setState(data);
    },

    initialCallback: function(data) {
    	this.setState(data);
    },

    handleCellClick: function(item) {
        Actions.clearAndSelect([item]);
        Actions.clickOnCell(item);
    },

    handleCheck: function(item) {
        if (item.isSelected === true) {
            Actions.deselect([item]);
        } else {
            Actions.select([item]);
        }
    },

    handleCheckAll: function(e) {

        if (e.target.checked === true) {
            Actions.select(this.state.tableData.rows);
        } else {
            Actions.deselectAll();
        }
    },

    handleTableHeaderClick: function(item) {
        Actions.sort(item);
    },

    createTable: function() {

    	if (this.state === null) return;

        var template = {

            table: function() {

                var th = this.state.tableData.headers.map(function(item, i) {
                    var sort = this.state.sortable.indexOf(item) > -1 ? this.handleTableHeaderClick.bind(null, item) : null;
                    console.log(this.state.sortArrow.item);
                    var arrow = this.state.sortArrow.item === item ? (
                        <i className={"sort_arrow " + this.state.sortArrow.direction}></i>
                    ) : null;

                    return (
                        <th onClick={sort}>
                            {item}
                            {arrow}
                        </th>
                    );
                }, this);

                var rows = this.state.tableData.rows.map(function(row, i) {

                    var rowData = row.row.map(function(data, j) {
                        return (<td onClick={this.handleCellClick.bind(null, row)}>{data}</td>)
                    }, this);

                    return (
                        <tr className={(row.isSelected === true) ? "selected" : ""}>
                            <td>
                                <input type="checkbox" checked={row.isSelected} onChange={this.handleCheck.bind(null, row)}/>
                            </td>
                            {rowData}
                        </tr>
                    );
                }, this);

                return (
                    <div ref="mainComponent" className="maincomp">
                        <table>

                            <thead>
                                <tr>
                                    <th>
                                        <input type="checkbox" onClick={this.handleCheckAll}/>
                                    </th>
                                    {th}
                                </tr>
                            </thead>

                            <tbody>
                                {rows}
                            </tbody>

                        </table>
                    </div>
                )

            },

            spinner: function() {
                return (
                    <div className="spinner">
                        <div className="pong-loader"></div>
                    </div>
                );
            }
        }

      	var result = (this.state.isRender === true && this.state.isWaiting) ? template["spinner"].call(this) :
                     (this.state.isRender === true) ? template["table"].call(this) : null;

        return result;
    },

    render: function() {
        console.time("createTable");
        return (
            <div>
                {this.createTable()}
            </div>
        );

    },

    componentDidUpdate: function() {
        console.timeEnd("createTable");
        console.log("-----------------------------");
    }
});

module.exports = Main;
