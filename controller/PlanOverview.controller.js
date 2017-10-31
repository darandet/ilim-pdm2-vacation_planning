sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/model/json/JSONModel"
], function (Controller, Dialog, Button, JSONModel) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.PlanOverview", {

        /**
         * @namespace ilim.pdm2.vacation_planning.PlanOverview
         */

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.PlanOverview
         */
        onInit: function() {

            var that = this;

            var oOverviewState = {
                busy: true
            };


            this.getRouter().getRoute("PlanOverview").attachPatternMatched(this._patternMatched, this);


            var oStateModel= new JSONModel(oOverviewState);
            this.setModel(oStateModel, "headerState");

        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf ilim.pdm2.vacation_planning.PlanOverview
         */
        onBeforeRendering: function() {

        },

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf ilim.pdm2.vacation_planning.PlanOverview
         */
        onAfterRendering: function() {

        },

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf ilim.pdm2.vacation_planning.PlanOverview
         */
        onExit: function() {

        },

        onShowRoute: function () {
            var that = this;
            if (!that.routeDialog) {

                var oFormFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.ApprovalRoute");

                that.routeDialog = new Dialog({
                    title: 'Маршрут согласования',
                    contentWidth: "15%",
                    draggable: true,
                    content: oFormFragment,
                    endButton: new Button({
                        text: "Закрыть",
                        press: function () {
                            that.routeDialog.close();
                        }
                    })
                });

                //to get access to the global model
                that.getView().addDependent(that.routeDialog);
            }

            that.routeDialog.open();
        },

        onShowComments: function () {
            var that = this;
            if (!that._mRecordCreateDialog) {

                var oFormFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.PlanComments");

                that._mRecordCreateDialog = new Dialog({
                    title: 'Комментарии к плану',
                    contentWidth: "35%",
                    draggable: true,
                    content: oFormFragment,
                    endButton: new Button({
                        text: "Закрыть",
                        press: function () {
                            that._mRecordCreateDialog.close();
                        }
                    })
                });

                //to get access to the global model
                that.getView().addDependent(that._mRecordCreateDialog);

            }

            that._mRecordCreateDialog.open();
        },

        onShowPeriods: function (oEvent) {

            if (! this._oPeriodsPopover) {
                this._oPeriodsPopover = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.PeriodSelect", this);
                this.getView().addDependent(this._oPeriodsPopover);

                var oModel = new JSONModel("http://localhost:3000/periods?status=open");
                this._oPeriodsPopover.setModel(oModel, "planYears");

            }

            this._oPeriodsPopover.openBy(oEvent.getSource());
        },

        onYearSelect: function (oEvent) {

            var sKey = oEvent.getParameter("item").getKey();
            var oPeriodModel = this.getModel("period");

            var sCurrentPeriod = oPeriodModel.getProperty("/year");

            if (sKey === sCurrentPeriod) {
                this._oPeriodsPopover.close();
                return;
            }

            this.getModel("headerState").setProperty("/busy", true);

            var oHeaderModel = this.getModel("header");

            var sUser = this.getOwnerComponent().current_user.user;

            oPeriodModel.loadData("http://localhost:3000/periods/" + sKey);

            oHeaderModel.loadData("http://localhost:3000/available_days?employee=" + sUser + "&year=" + sKey);

            this._oPeriodsPopover.close();

            this._raiseYearSelectEvent(sKey);

        },


        _raiseYearSelectEvent: function (selectedYear) {

            var that = this;
            var oEventBus = sap.ui.getCore().getEventBus();
            this.getOwnerComponent().oRolesLoaded.then(function (oData) {
                var sPlanPath = "/VacationPlanHdrSet(PlanYear='" + selectedYear + "',Pernr='" + oData.EmployeeId + "')";
                that.getView().bindElement({
                    path: sPlanPath,
                    parameters: {
                        expand: "ToVacations"
                    },
                    model: "oData",
                    events: {
                        dataReceived: function () {
                            that.getModel("headerState").setProperty("/busy", false);
                        }
                    }
                });

                oEventBus.publish("headerChanges", "yearSelection", { key: selectedYear, EmployeeId: oData.EmployeeId });
            });
        },


        _patternMatched: function () {

            var that = this;

            var oDataModel = this.getOwnerComponent().getModel("oData");

            var fnDataReceived = function (oData, response) {

                if (!oData.PlanYear) {
                    that.getRouter().navTo("PlanningClosed");
                    return;
                }

                that._raiseYearSelectEvent(oData.PlanYear);
            };

            var fnRequestError = function (oError) {

                if (oError.statusCode === "404") {
                    that.getRouter().navTo("PlanningClosed");
                }
            };

            this.getOwnerComponent().oRolesLoaded.then(function (oData) {

                oDataModel.read("/MasterRecordSet(PlanYear='',Bukrs='')", {
                    success:fnDataReceived,
                    error: fnRequestError
                });

            });

        }

    });

});