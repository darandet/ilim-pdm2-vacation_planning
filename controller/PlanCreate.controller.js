sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "jquery.sap.global",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "ilim/pdm2/vacation_planning/model/formatter",
    "sap/m/MessageBox"
], function (Controller, $, JSONModel, ODataModel, Formatter, MessageBox) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.PlanCreate", {


        formatter: Formatter,

        selectedPeriod: "",


        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.PlanCreate
         */
        onInit: function() {


            var oPlanCreateState = {
                busy: true
            };
            var oStateModel= new JSONModel(oPlanCreateState);
            this.setModel(oStateModel, "contentState");


            var oCalModel = new JSONModel();
            this.setModel(oCalModel, "calendar");


            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.subscribe("headerChanges", "yearSelection", this._updatePlan, this);

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

        onShowActions: function (oEvent) {

            var oModel;
            var oButton = oEvent.getSource();

            this.onShowActions.timesCalled = 0;

            if (!this._actionSheet) {
                this._actionSheet = sap.ui.xmlfragment(
                    "ilim.pdm2.vacation_planning.view.fragments.VacationActions",
                    this
                );
                this.getView().addDependent(this._actionSheet);

                oModel = new JSONModel();
                this._actionSheet.setModel(oModel, "vacation");
                this._actionSheet.timesCalled = 0;

            }

            var oVacation = this.getView().byId("vacationsTable")
                .getModel("oData").getObject(oButton.getParent().getBindingContextPath());


            oModel = this._actionSheet.getModel("vacation");
            oModel.setData(oVacation);

            if (this._actionSheet.timesCalled === 0) {
                var that = this;

                //Because of a weird bug with rendering;
                this._actionSheet.timesCalled++;
                setTimeout(function () {
                    that._actionSheet.openBy(oButton)
                }, 100);
            } else {
                this._actionSheet.openBy(oButton);
            }

        },

        onAddVacation: function (oEvent) {

            var oDateRangeInput = this.getView().byId("VacationRangeInput");
            var oCalendar       = this.getView().byId("calendar");

            if (!oDateRangeInput.getDateValue()) {
                MessageBox.error(
                    this.getResourceBundle().getText("vacation.create.wrongDates"),
                    {
                        styleClass: this.getOwnerComponent().getContentDensityClass()
                    }
                );

                return;
            }

            var sBindingPath = this.getView().getBindingContext("oData").getPath();
            var oContextObj = this.getModel("oData").getObject(sBindingPath);
            this._addVacationToPlan(
                oContextObj.PlanYear, oContextObj.Pernr,
                oDateRangeInput.getDateValue(), oDateRangeInput.getSecondDateValue()
            );

            oDateRangeInput.setDateValue();
            oCalendar.removeAllSelectedDates();

        },

        onItemAction: function (oEvent) {

            var oButton = oEvent.getSource();
            var aCustomData = oButton.getCustomData();

            var sFunction;

            for (var i=0; i < aCustomData.length; i++) {

                if (aCustomData[i].getKey() === "function") {

                    sFunction = aCustomData[i].getValue();

                }
            }

            if (sFunction === "delete") {
                var oModel = this._actionSheet.getModel("vacation")
                var oObjectToDelete = oModel.getData();
                this._deleteItem(oObjectToDelete);
            }

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
                } else {
                    oDateRangeInput.setSecondDateValue();
                }
            }

        },

        _updatePlan: function (sChannel, sEvent, oData) {

            if (sChannel === "headerChanges" && sEvent === "yearSelection") {

                var oCalModel = this.getModel("calendar");
                var oCalData = {
                    minDate: new Date(oData.key),
                    maxDate: new Date(oData.key, "11", "31")
                };
                oCalModel.setData(oCalData);


            }

        },

        _addVacationToPlan: function (Year, Pernr, BeginDate, EndDate) {

            var that = this;

            // var sServiceUrl = "http://localhost:3000/vacations";
            var oDataModel = this.getOwnerComponent().getModel("oData");
            var endda;

            if (EndDate) {
                endda = EndDate;
            } else {
                endda = BeginDate;
            }

            var oNewVacation = {
                PlanYear: Year,
                Pernr: Pernr,
                BeginDate: BeginDate,
                EndDate: endda,
                VpProc: "",
                VpStatus: "",
                PlanGuid: "",
                Action: "",
                DoCommit: true
            };

            oDataModel.create("/VacationPlanPosSet", oNewVacation);

        },

        _deleteItem: function (oObject) {

            var sServiceUrl = "http://localhost:3000/vacations";
            var that = this;

            $.ajax({
                url: sServiceUrl,
                type: 'DELETE',
                data: oObject
            })
                .done(function (oDeletedObject) {

                    that.getModel("data").loadData("http://localhost:3000/vacations/" + that.selectedPeriod
                        + "?pernr=" + that.getOwnerComponent().current_user.pernr);

                });


        }

    });

});