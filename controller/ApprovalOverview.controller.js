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

            var oOverviewState = {
                busy: false
            };
            var oStateModel= new JSONModel(oOverviewState);
            this.setModel(oStateModel, "screenState");


            var fnDataReceived = function (oData, response) {

                if (!oData.PlanYear) {
                    that.getRouter().navTo("PlanningClosed");
                } else {
                    that.oManagerController.setOnlySubord('X');                    
                    that._raiseYearSelectEvent(oData.PlanYear);
                }
            };

            var fnRequestError = function (oError) {

                if (oError.statusCode === "404") {
                    that.getRouter().navTo("PlanningClosed");
                }
            };

            this.oManagerController = this.getOwnerComponent().oManagerController;
            this.oManagerController.setModel(this.getOwnerComponent().getModel("oData"));
            this.oManagerController.getManagerDefaultPeriod("/ManagingPeriodsSet(PlanYear='',OnlySubord='')", fnDataReceived, fnRequestError);            
        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controllers View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf ilim.pdm2.vacation_planning.ApprovalOverview
         */
        //  onBeforeRendering: function() {
        //
        //  },

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalOverview
         */
        //  onAfterRendering: function() {
        //
        //  },

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalOverview
         */
        //  onExit: function() {
        //
        //  }

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

            var oObject = this.getModel("oData").getObject(this.getView().getBindingContext("oData").getPath());
            if (sKey === 'approvalTab') {
                this._raiseYearSelectEvent(oObject.PlanYear);
                oRouter.navTo('ManageApprovals');
            } else if (sKey === 'overviewTab') {
                this._raiseYearSelectEvent(oObject.PlanYear);
                oRouter.navTo('ApprovalsDashboard');
            }
        },
        
        onSubordPress: function (oEvent) {

            //if (oEvent.getSource().getPressed()) {
            if (oEvent.getParameter('key') === "subord") {                
                this.oManagerController.setOnlySubord('X');
            } else {
                this.oManagerController.setOnlySubord('');
            }
            this._raiseYearSelectEvent(this.getModel("oData").getObject(this.getView().getBindingContext("oData").getPath()).PlanYear);
        },        

        onShowPeriods: function (oEvent) {
            if (! this._oPeriodsPopover) {
                this._oPeriodsPopover = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.ManagingPeriodsSelect", this);
                this.getView().addDependent(this._oPeriodsPopover);

            }

            this._oPeriodsPopover.openBy(oEvent.getSource());
        },

        onYearSelect: function (oEvent) {

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

            var that      = this;
            var oEventBus = sap.ui.getCore().getEventBus();
            var subord    = this.oManagerController.getOnlySubord();            

            var fnDataRequested = function () {
                that.getModel("screenState").setProperty("/busy", true);
            };

            var fnDataReceived = function () {
                that.getModel("screenState").setProperty("/busy", false);
            };

            this.getOwnerComponent().oRolesLoaded.then(function (oRolesData) {

                that.oManagerController.setCurrentYear(selectedYear);
                var sPlanPath = "/ManagingPeriodsSet(PlanYear='" + selectedYear + "',OnlySubord='" + subord + "')";
                if (that.getModel("viewSync").getProperty('/key') === "approvalTab")
                {
                  that.getView().bindElement({
                      path: sPlanPath,
                      parameters: {
                          expand: "ToManager,ToDepartment,ToStatus,ToTransferStatus,ToTransferDepartment,ToTransferManager,ToConfirmStatus,ToConfirmManager,ToConfirmDepartment,ToConfirmInbox,ToTransferInbox"
                      //    expand: "ToInbox,ToInbox/ToVacations,ToManager,ToDepartment,ToStatus"
                      },
                      events: {
                          dataRequested: fnDataRequested,
                          dataReceived: fnDataReceived
                      },
                      model: "oData"
                  });
                } else if (that.getModel("viewSync").getProperty('/key') === "overviewTab") {
                  that.getView().bindElement({
                      path: sPlanPath,
                      parameters: {
                          expand: "ToAbsPercGraph,ToApprNumGraph,ToVacPlanDaysGraph"
                      },
                      events: {
                          dataRequested: fnDataRequested,
                          dataReceived: fnDataReceived
                      },
                      model: "oData"
                  });
                }

                oEventBus.publish("managerHeaderChanges", "yearSelection", { PlanYear: selectedYear });
            });
        }
        
    });

});