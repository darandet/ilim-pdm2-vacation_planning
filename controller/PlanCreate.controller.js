sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "jquery.sap.global",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/MessageBox",    
    "ilim/pdm2/vacation_planning/model/formatter"
], function (Controller, $, JSONModel, ODataModel, Dialog, Button, MessageBox, Formatter) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.PlanCreate", {


        formatter: Formatter,

        sVacationItemsPath: "/VacationPlanPosSet",

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.PlanCreate
         */
        onInit: function() {


            var oPlanCreateState = {
                busy: false
            };
            var oStateModel= new JSONModel(oPlanCreateState);
            this.setModel(oStateModel, "contentState");


            var oCalModel = new JSONModel();
            this.setModel(oCalModel, "calendar");


            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.subscribe("headerChanges", "yearSelection", this._updatePlan, this);
            oEventBus.subscribe("headerChanges", "planLoading", this._updatePlan, this);
            oEventBus.subscribe("headerChanges", "planReceived", this._updatePlan, this);

            oEventBus.subscribe("oDataRequest", "SendSuccess", this._refreshTableAfterSend, this);
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
                this._showErrorInContainer(this.getResourceBundle().getText("vacation.create.wrongDates"));

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
                var oModel = this._actionSheet.getModel("vacation");
                var oObjectToDelete = oModel.getData();
                this._deleteItem(oObjectToDelete);
            } else if(sFunction === "confirm"){
                var oModel = this._actionSheet.getModel("vacation");
                var oObjectToConfirm = oModel.getData();
                var sReqType = "CRQ";
                this._modifyVacation(oObjectToConfirm, sReqType);
            } else {
                var oModel = this._actionSheet.getModel("vacation");
                var oObjectToTransfer = oModel.getData();
                var sReqType = "TRQ";
                this._modifyVacation(oObjectToTransfer, sReqType);
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

            var oContentStateModel = this.getModel("contentState");

            if (sChannel === "headerChanges" && sEvent === "yearSelection") {
                //var oCalModel = this.getModel("calendar");
                // var oCalData = {
                //     minDate: new Date(oData.key),
                //     maxDate: new Date(oData.key, "11", "31")
                // };
                // oCalModel.setData(oCalData);

            } else if (sChannel === "headerChanges" && sEvent === "planLoading") {
                oContentStateModel.setProperty("/busy", true);
            } else if (sChannel === "headerChanges" && sEvent === "planReceived") {
                oContentStateModel.setProperty("/busy", false);
            }

        },

        _addVacationToPlan: function (Year, Pernr, BeginDate, EndDate) {

            var that = this;

            var sDummyGUID = "12345678-aaaa-bbbb-cccc-ddddeeeeffff";
            var oDataModel = this.getModel("oData");
            var endda;

            if (EndDate) {
                endda = EndDate;
            } else {
                endda = BeginDate;
            }

            var fnAddDay = function (date, days) {
                var result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
            };

            var oNewVacation = {
                PlanYear: Year,
                Pernr: Pernr,
                ItemGuid: sDummyGUID,
                BeginDate: fnAddDay(BeginDate, 1),
                EndDate: fnAddDay(endda, 1),
                VpProc: "",
                VpStatus: "",
                PlanGuid: sDummyGUID,
                Action: "",
                DoCommit: true
            };

            oDataModel.create(this.sVacationItemsPath, oNewVacation, {
                error: this._showErrorInContainer.bind(this)
            });

        },

        _deleteItem: function (oObject) {

            var that = this;
            var oDataModel = this.getModel("oData");

            var sCurrentContextPath = this.getView().getBindingContext("oData").getPath();
            var oCtxObject = oDataModel.getObject(sCurrentContextPath);

            var sObjectKey = "";
            sObjectKey = sObjectKey + "(OnlySubord='',";
            sObjectKey = sObjectKey + "PlanYear='" + oCtxObject.PlanYear + "',";
            sObjectKey = sObjectKey + "Pernr='" + oCtxObject.Pernr + "',";
            sObjectKey = sObjectKey + "ItemGuid=guid'" + oObject.ItemGuid + "')";

            oDataModel.remove(this.sVacationItemsPath + sObjectKey);
        },

        _showErrorInContainer: function (Error) {

            var oMessageContainer = this.getView().byId("MessageContainer");
            var sText;

            if (typeof Error === "object") {
                var oErrorResponse = JSON.parse(Error.responseText);
                if (Error.statusCode === "400") {
                    sText = oErrorResponse.error.message.value;
                } else {
                    sText = this.getResourceBundle().getText("vacation.create.sendUnknownError");
                }
            } else if (typeof Error === "string") {
                sText = Error;
            }

            oMessageContainer.setText(sText);
            oMessageContainer.setVisible(true);

            var hideMessage = function () {
                oMessageContainer.close();
            };

            setTimeout(hideMessage, 5000); //CSS delay doesn't work
        },

        _refreshTableAfterSend: function () {

            var oTable = this.getView().byId("vacationsTable");
            var oTableBinding = oTable.getBinding("items");

            oTableBinding.refresh();
        },
        
        _modifyVacation: function (oObjectToModify, sRequestType) {

            var oDataModel = this.getModel("oData");
            var oEventBus = sap.ui.getCore().getEventBus();

            var that = this;

            var fnHandleSuccess = function (oData, response) {

                that.getModel("screenState").setProperty("/busy", false);

                oEventBus.publish("oDataRequest", "SendSuccess");

                var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
                MessageBox.success(
                    oData.MessageText,
                    {
                        styleClass: bCompact ? "sapUiSizeCompact" : ""
                    }
                );
            };

            var fnHandleError = function (oError) {

                that.getModel("screenState").setProperty("/busy", false);

                var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
                var oErrorResponse = JSON.parse(oError.responseText);
                if (oError.statusCode === "400") {
                    MessageBox.error(
                        oErrorResponse.error.message.value,
                        {
                            styleClass: bCompact ? "sapUiSizeCompact" : ""
                        }
                    );
                } else {
                    MessageBox.error(
                        that.getResourceBundle().getText("vacation.create.sendUnknownError"),
                        {
                            styleClass: bCompact ? "sapUiSizeCompact" : ""
                        }
                    );
                }
            };


            if (!this.approveCommentDialog) {

                var oComment = {
                    BeginDate: oObjectToModify.BeginDate,
                    EndDate:   oObjectToModify.EndDate,
                    Comment:   ""
                };

                if (sRequestType === "CRQ")
                {
                  var oDialogFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.CommentsDialog");
                } else {
                  var oDialogFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.DatesCommentsDialog");
                }
                
                var oCommentModel = new JSONModel(oComment);
                this.approveCommentDialog = new Dialog({
                    title: this.getResourceBundle().getText("common.commentsDialog.Title"),
                    draggable: true,
                    content: oDialogFragment,
                    type: 'Message',
                    beginButton: new Button({
                        text: this.getResourceBundle().getText("common.commentsDialog.CancelButton"),
                        type: sap.m.ButtonType.Reject,
                        press: function () {
                            that.approveCommentDialog.close();
                        }
                    }),
                    endButton: new Button({
                        text: this.getResourceBundle().getText("common.commentsDialog.SendButton"),
                        type: sap.m.ButtonType.Accept,
                        press: function () {

                            that.getModel("screenState").setProperty("/busy", true);

                            var oCommentModel = that.approveCommentDialog.getModel("comment");
                            oDataModel.callFunction("/CreateRequest", {
                                method: "POST",
                                urlParameters: {
                                    VacationGUID: oObjectToModify.ItemGuid,
                                    NewBeginDate: oCommentModel.getProperty("/BeginDate"),
                                    NewEndDate:   oCommentModel.getProperty("/EndDate"),
                                    RequestType:  sRequestType,
                                    Comment:      oCommentModel.getProperty("/Comment")
                                },
                                success: fnHandleSuccess,
                                error: fnHandleError
                            });

                            oCommentModel.setProperty("/Comment", "");
                            that.approveCommentDialog.close();
                        }
                    }),
                    afterClose: function() {
                        that.approveCommentDialog.destroy();
                        that.approveCommentDialog = undefined;
                    }
                });
                this.approveCommentDialog.setModel(oCommentModel, "comment");
                this.getView().addDependent(this.approveCommentDialog);


            }

            this.approveCommentDialog.open();
        }        


    });

});
