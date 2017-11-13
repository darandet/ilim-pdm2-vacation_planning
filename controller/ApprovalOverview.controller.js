sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "ilim/pdm2/vacation_planning/utils/managerController"
], function (Controller, JSONModel, managerController) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.ApprovalOverview", {

        /**
         * @namespace ilim.pdm2.vacation_planning.ApprovalOverview
         */

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalOverview
         */

        oManagerController: {},

        onInit: function() {

            var that = this;
            this.getRouter().getRoute("ApprovePlan").attachPatternMatched(this._patternMatched, this);
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.subscribe("childNavigation", "syncViews", this._syncViews, this);


            var oModel = new JSONModel({ key: "approvalTab" });
            this.setModel(oModel, "viewSync");


            var fnDataReceived = function (oData, response) {

                if (!oData.PlanYear) {
                    that.getRouter().navTo("PlanningClosed");
                }
            };

            var fnRequestError = function (oError) {

                if (oError.statusCode === "404") {
                    that.getRouter().navTo("PlanningClosed");
                }
            };

            this.oManagerController = this.getOwnerComponent().oManagerController;
            this.oManagerController.setModel(this.getOwnerComponent().getModel("oData"));
            this.oManagerController.getManagerDefaultPeriod("/ManagingPeriodsSet('')", fnDataReceived, fnRequestError);
            
        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf ilim.pdm2.vacation_planning.ApprovalOverview
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalOverview
         */
        //	onAfterRendering: function() {
        //
        //	},

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalOverview
         */
        //	onExit: function() {
        //
        //	}

        /**
         * Переключает экран руководителя в зависимости от нажатой кнопки.
         * Изменение экрана осуществляется с помощью навигации через sap.m.Router
         * @event sap.m.Button#press
         * @param oEvent
         * @memberOf ilim.pdm2.vacation_planning.ApprovalOverview
         */
        onViewChange: function(oEvent) {

            var sKey = oEvent.getParameter('key');
            var oRouter = this.getRouter();

            if (sKey === 'approvalTab') {
                oRouter.navTo('ManageApprovals');
            } else if (sKey === 'overviewTab') {
                oRouter.navTo('ApprovalsDashboard');
            }

        },

        onShowPeriods: function () {
            if (! this._oPeriodsPopover) {
                this._oPeriodsPopover = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.PeriodSelect", this);
                this.getView().addDependent(this._oPeriodsPopover);

            }

            this._oPeriodsPopover.openBy(oEvent.getSource());
        },

        onYearSelect: function () {

            var sKey = oEvent.getParameter("item").getKey();

            var sCurrentBindingPath = this.getView().getBindingContext("oData").getPath();
            var oCtxObject = this.getModel("oData").getObject(sCurrentBindingPath);

            if (sKey === oCtxObject.PlanYear) {
                this._oPeriodsPopover.close();
                return;
            }

            this._oPeriodsPopover.close();

            this._raiseYearSelectEvent(sKey);
        },

        /**
         * Автоматическая переадресация при переходе в корневой узел
         * @private
         */
        _patternMatched: function () {

            var that = this;
            var oRouter = this.getRouter();
            var oDataModel = this.getOwnerComponent().getModel("oData");

            var fnDataReceived = function (oData, response) {

                if (oData.PlanYear) {
                    that._raiseYearSelectEvent(oData.PlanYear);
                }
            };

            this.getOwnerComponent().oRolesLoaded.then( function (oData) {
                if (!oData.CanApprove) {
                    oRouter.navTo("NoAuthorization");
                } else {
                    that.oManagerController.oWhenPeriodIsLoaded.then( fnDataReceived );
                    oRouter.navTo('ManageApprovals');
                }
            });

        },

        /**
         * Данный обработчик ловит только событие "syncView" на канале "childNavigation"
         * При получении такого события меняет значение модели viewSync для переключения нужной кнопки в активный режим
         * @param {string} sChannel Имя канала получения события
         * @param {string} sEvent Имя самого события
         * @param {object} oData Объект с данным переданным из эмиттера события. Данный метод ожидает атрибут "key"
         * @private
         * @memberOf ilim.pdm2.vacation_planning.ApprovalOverview
         */
        _syncViews: function (sChannel, sEvent, oData) {


            if (sChannel === "childNavigation" && sEvent === "syncViews" ) {

                var oModel = this.getModel("viewSync");
                oModel.setProperty('/key', oData.key)
            }

        },

        _raiseYearSelectEvent: function (selectedYear) {

            var that = this;
            var oEventBus = sap.ui.getCore().getEventBus();
            this.getOwnerComponent().oRolesLoaded.then(function (oRolesData) {

                that.oManagerController.setCurrentYear(selectedYear);
                var sPlanPath = "/ManagingPeriodsSet('" + selectedYear + "')";
                that.getView().bindElement({
                    path: sPlanPath,
                    model: "oData"
                });


                oEventBus.publish("managerHeaderChanges", "yearSelection", { PlanYear: selectedYear });
            });
        },
        
    });

});