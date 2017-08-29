sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "jquery.sap.global",
    'sap/ui/model/Filter'
], function (Controller, JSONModel, $, Filter) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.ApprovalManage", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalManage
         */

        selectedEmployees: [],

        onInit: function() {

            var that = this;

            var oSourceModel = new JSONModel("http://localhost:3000/employees");
            var oInboxModel = new JSONModel();
            this.setModel(oInboxModel, "inbox");

            oSourceModel.attachRequestCompleted(function () {


                var aSource = oSourceModel.getData().results;
                var aTarget = [];
                var oObjectExtend = {
                    highlight: sap.ui.core.MessageType.None
                };
                var oScreenObject = {};

                for (var i=0; i < aSource.length; i++ ) {
                    oScreenObject = $.extend({}, oObjectExtend, aSource[i]);

                    aTarget.push(oScreenObject);

                }
                oInboxModel.setData(aTarget);

            });

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
                this.selectedEmployees.push(oObject.login.username)
            }
        },

        onEmployeeSearch: function (oEvent) {

            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                var filter = new Filter("name/last", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter);
                filter = new Filter("id/value", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter);

                filter = new Filter({filters: aFilters, and: false});



            }

            // update list binding
            var list = this.getView().byId("inboxTable");
            var binding = list.getBinding("items");
            binding.filter(filter);
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