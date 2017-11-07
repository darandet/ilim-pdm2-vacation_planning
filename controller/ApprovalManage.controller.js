sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "jquery.sap.global",
    "sap/ui/model/Filter",
    "ilim/pdm2/vacation_planning/utils/managerController"
], function (Controller, JSONModel, $, Filter, managerController) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.ApprovalManage", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalManage
         */

        selectedEmployees: [],

        onInit: function() {

            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.subscribe("managerHeaderChanges", "yearSelection", this._filterInboxByYear, this);

            this.getRouter().getRoute("ManageApprovals").attachPatternMatched(this._patternMatched, this);

        },

        onShowSelected: function (oEvent) {

            this.getRouter().navTo("ApprovalDetails", {
                selectedEmployees: JSON.stringify(this.selectedEmployees)
            });
        },

        onEmployeeSelect: function (oEvent) {

            this.selectedEmployees = [];
            var oList = oEvent.getSource();
            var oModel = this.getModel("inbox");

            for (var i=0; i < oList.getSelectedContexts().length; i++) {
                var oObject = oModel.getObject(oList.getSelectedContexts()[i].sPath);
                this.selectedEmployees.push(oObject.employeeId)
            }
        },

        onEmployeeSearch: function (oEvent) {

            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("EmployeeName", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter);
                filter = new Filter("EmployeeId", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter);

                filter = new Filter({filters: aFilters, and: false});



            }

            // update list binding
            var list = this.getView().byId("inboxTable");
            var binding = list.getBinding("items");
            binding.filter(filter);
        },

        _filterInboxByYear: function (sChannel, sEvent, oData) {

            var aFilters = [];
            var filter = new Filter("PlanYear", sap.ui.model.FilterOperator.EQ, oData.PlanYear);

            aFilters.push(filter);

            // update list binding
            var list = this.getView().byId("inboxTable");
            var binding = list.getBinding("items");
            binding.filter(filter);

        },

        _patternMatched: function () {

            managerController.oWhenPeriodIsLoaded.then( function (oData) {

                this._filterInboxByYear(null, null, oData);

            });

        }

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf ilim.pdm2.vacation_planning.ApprovalManager
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalManager
         */
        //	onAfterRendering: function() {
        //
        //	},

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalManager
         */
        //	onExit: function() {
        //
        //	}
    });

});