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
        oManagerController: {},

        onInit: function() {

            this.getRouter().getRoute("ApprovalDetails").attachPatternMatched(this._patternMatched, this);
            this.oManagerController = this.getOwnerComponent().oManagerController;

            var oJSONModel = new JSONModel();
            this.setModel(oJSONModel, "vacations");

        },

        onBackToInbox: function () {

            this.getRouter().navTo("ManageApprovals");

        },

        _patternMatched: function () {

            var aSelectedContexts = this.oManagerController.getSelectedEmployees();
            var oDataModel        = this.getOwnerComponent().getModel("oData");

            var aJSONData         = [];
            var Object            = {};


            for (var i=0; i < aSelectedContexts.length; i++) {
                Object = oDataModel.getObject(aSelectedContexts[i].getPath());
                aJSONData.push(oDataModel.getObject("/" + Object.ToVacations));
            }

            this.getModel("vacations").setData(aJSONData);
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