sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.PlanCreate", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.PlanCreate
         */
        onInit: function() {

            var oModel = new JSONModel();
            oModel.loadData("http://localhost:3000/vacations");

            this.setModel(oModel, "data");
        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf ilim.pdm2.vacation_planning.PlanCreate
         */
        onBeforeRendering: function() {

        },

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf ilim.pdm2.vacation_planning.PlanCreate
         */
        onAfterRendering: function() {

        },

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf ilim.pdm2.vacation_planning.PlanCreate
         */
        onExit: function() {

        },

        onDateRangeSelect: function (oEvent) {

            var oCalendar = oEvent.getSource();
            var oDateRangeInput = this.getView().byId("VacationRangeInput");

            this._updateDateRangeInput(oCalendar, oDateRangeInput);

        },

        _updateDateRangeInput: function (oCalendar, oDateRangeInput) {

            var oDate;
            var aSelectedDates = oCalendar.getSelectedDates();

            if (aSelectedDates.length > 0) {
                oDate = aSelectedDates[0].getStartDate();
                if (oDate) {
                    oDateRangeInput.setDateValue(oDate);
                }
                oDate = aSelectedDates[0].getEndDate();
                if (oDate) {
                    oDateRangeInput.setSecondDateValue(oDate);
                }
            }

        }
    });

});