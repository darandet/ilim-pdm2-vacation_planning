sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter"
], function (Controller, JSONModel, Filter) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.ApprovalDashboard", {

        /**
         * @namespace ilim.pdm2.vacation_planning.ApprovalDashboard
         */

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalDashboard
         */
        onInit: function() {

            this.getRouter().getRoute("ApprovalsDashboard").attachPatternMatched(this._patternMatched, this);

            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.subscribe("managerHeaderChanges", "yearSelection", this._filterDashboardByYear, this);

            this.oManagerController = this.getOwnerComponent().oManagerController;
        },

        onDownloadT7: function () {

            var sYear = this.oManagerController.getCurrentYear();
            var sServicePath = this.getOwnerComponent().getManifestEntry("sap.app").dataSources.MainService.uri;
            var sODataKey = "(PlanYear='" + sYear +"',EmployeeId='')";

            window.open(sServicePath + "/NoAccessEmployeesSet" + sODataKey +  "/$value");
        },

        /**
         * @event ApprovalDashboard#syncViews
         * @property {string} key - передаёт ключ кнопки, которая должна быть активирована
         * @private
         */
        _patternMatched: function () {
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.publish("childNavigation", "syncViews", { key: "dashboardTab" });

            var that = this;

            this.getOwnerComponent().oRolesLoaded.then( function (oData) {
                if (!oData.CanApprove) {
                    that.getRouter().navTo("NoAuthorization");
                } else {
                    that.oManagerController.oWhenPeriodIsLoaded.then( function (oData) {                        
                        //oEventBus.publish("childNavigation", "graphAppears");
                        //that._filterDashboardByYear(null, null, oData);
                    });
                }
            });
        },

        _filterDashboardByYear: function (sChannel, sEvent, oData) {

            var aFilters = [];
            var filter = new Filter("PlanYear", sap.ui.model.FilterOperator.EQ, oData.PlanYear);

            //aFilters.push(filter);

            // update list binding
            //var list = this.getView().byId("noAccessEmployeesTable");
            //var binding = list.getBinding("items");
            //if (binding) {
            //    binding.filter(filter);
            //}
            
            //binding = this.getView().byId("idVizFrame").getDataset().getBinding("data");
            //if (binding) {
            //    binding.filter(filter);
            //}                
            
            //binding = this.getView().byId("idVizFrame2").getDataset().getBinding("data");
            //if (binding) {
            //    binding.filter(filter);
            //}                
            
            //binding = this.getView().byId("idVizFrame3").getDataset().getBinding("data");
            //if (binding) {
            //    binding.filter(filter);
            //}                            
        } 
    });
});
