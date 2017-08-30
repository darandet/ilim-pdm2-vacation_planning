sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.ApprovalDetails", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalDetails
         */

        selectedEmployees: [],

        onInit: function() {

            this.getRouter().getRoute("ApprovalDetails").attachPatternMatched(this._patternMatched, this);

        },

        onBackToInbox: function (oEvent) {

            this.getRouter().navTo("ManageApprovals");

        },

        _patternMatched: function (oEvent) {

            var oModel, sFilter;
            var oArgs = oEvent.getParameter("arguments");

            this.selectedEmployees = JSON.parse(oArgs.selectedEmployees);

            if (this.getModel("vacations")) {
                oModel = this.getModel("vacations");
            } else {
                oModel = new JSONModel();
                this.setModel(oModel, "vacations");
            }

            sFilter = this.selectedEmployees.join();

            oModel.loadData("http://localhost:3000/employees/vacations?filter=" + sFilter);

        }

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf ilim.pdm2.vacation_planning.ApprovalDetails
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalDetails
         */
        //	onAfterRendering: function() {
        //
        //	},

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalDetails
         */
        //	onExit: function() {
        //
        //	}
    });

});