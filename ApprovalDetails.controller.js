sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "ilim/pdm2/vacation_planning/model/formatter"    
], function (Controller, JSONModel, Formatter) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.ApprovalDetails", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalDetails
         */

        selectedEmployees: [],
        oManagerController: {},

        formatter: Formatter,        
        
        onInit: function() {

            this.getRouter().getRoute("ApprovalDetails").attachPatternMatched(this._patternMatched, this);
            this.oManagerController = this.getOwnerComponent().oManagerController;

            var oJSONModel = new JSONModel();
            this.setModel(oJSONModel, "vacations");

            oJSONModel = new JSONModel();
            this.setModel(oJSONModel, "calendar")

        },

        onBackToInbox: function () {

            this.getRouter().navTo("ManageApprovals");

        },

        _patternMatched: function () {

            var aSelectedContextPaths = this.oManagerController.getSelectedEmployees();
            var oDataModel        = this.getOwnerComponent().getModel("oData");

            var aVacationsData = [], aVacationKeys = [], aCalendarData = [];
            var Object, Vacation, Type;
            var PossibleTypes = [1,2,3,4,5,6,7,8,9], TypesPool = [], randomType;


            for (var i=0; i < aSelectedContextPaths.length; i++) {
                Object        = oDataModel.getObject(aSelectedContextPaths[i]);
                Object.ToVacations = [];

                if (TypesPool.length < 1) {
                    TypesPool = PossibleTypes;
                }
                randomType = TypesPool.splice(Math.floor(Math.random() * TypesPool.length), 1);


                aVacationKeys = oDataModel.getObject(aSelectedContextPaths[i] + "/ToVacations");
                for (var j=0; j < aVacationKeys.length; j++){
                    Vacation = oDataModel.getObject("/" + aVacationKeys[j]);
                    Vacation.EmployeeName = Object.EmployeeName;
                    Vacation.Type = "Type0" + randomType[0];
                    aVacationsData.push(Vacation);
                    Object.ToVacations.push(Vacation);
                }
                aCalendarData.push(Object);
            }
            this.getModel("vacations").setData(aVacationsData);
            this.getModel("calendar").setData(aCalendarData);


            function getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
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
