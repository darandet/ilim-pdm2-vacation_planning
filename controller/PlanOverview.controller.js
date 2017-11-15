sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (Controller, Dialog, Button, JSONModel, MessageBox) {
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
                busy: false
            };


            this.getRouter().getRoute("PlanOverview").attachPatternMatched(this._patternMatched, this);


            var oStateModel= new JSONModel(oOverviewState);
            this.setModel(oStateModel, "screenState");

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
                    title: this.getResourceBundle().getText("vacation.route.Header"),
                    contentWidth: "15%",
                    draggable: true,
                    content: oFormFragment,
                    endButton: new Button({
                        text: this.getResourceBundle().getText("common.dialog.button.close"),
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

        onSendPlan: function () {

            var oDataModel = this.getModel("oData");
            var sCurrentCtxPath = this.getView().getBindingContext("oData").getPath();
            var oCurrentCtxObj = oDataModel.getObject(sCurrentCtxPath);
            var oEventBus = sap.ui.getCore().getEventBus();

            var that = this;

            var fnHandleSuccess = function (oData, response) {

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


            if (!this.commentDialog) {

                var oComment = {
                    comment: ""
                };

                var oDialogFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.CommentsDialog");
                var oCommentModel = new JSONModel(oComment);
                this.commentDialog = new Dialog({
                    title: this.getResourceBundle().getText("common.commentsDialog.Title"),
                    draggable: true,
                    content: oDialogFragment,
                    type: 'Message',
                    beginButton: new Button({
                        text: this.getResourceBundle().getText("common.commentsDialog.CancelButton"),
                        press: function () {
                            that.commentDialog.close();
                        }
                    }),
                    endButton: new Button({
                        text: this.getResourceBundle().getText("common.commentsDialog.SendButton"),
                        press: function () {

                            var oCommentModel = that.commentDialog.getModel("comment");
                            oDataModel.callFunction("/ActionOnVacationPlan", {
                                method: "POST",
                                urlParameters: {
                                    EmployeeId: oCurrentCtxObj.Pernr,
                                    PlanYear:   oCurrentCtxObj.PlanYear,
                                    Action:     "SEND",
                                    Comment:    oCommentModel.getProperty("/comment")
                                },
                                success: fnHandleSuccess,
                                error: fnHandleError
                            });

                            oCommentModel.setProperty("/comment", "");
                            that.commentDialog.close();
                        }
                    })

                });
                this.commentDialog.setModel(oCommentModel, "comment");
                this.getView().addDependent(this.commentDialog);


            }

            this.commentDialog.open();
        },


        _raiseYearSelectEvent: function (selectedYear) {

            var that = this;
            var oEventBus = sap.ui.getCore().getEventBus();
            
            var fnDataRequested = function () {
                that.getModel("screenState").setProperty("/busy", true);
                oEventBus.publish("headerChanges", "planLoading");
            };

            var fnDataReceived = function () {
                that.getModel("screenState").setProperty("/busy", false);
                oEventBus.publish("headerChanges", "planReceived");
            };
            
            this.getOwnerComponent().oRolesLoaded.then(function (oData) {
                var sPlanPath = "/VacationPlanHdrSet(PlanYear='" + selectedYear + "',Pernr='" + oData.EmployeeId + "')";
                that.getView().bindElement({
                    path: sPlanPath,
                    parameters: {
                        expand: "ToVacations,ToAbsenceRight,ToApprRoute"
                    },
                    model: "oData",
                    events: {
                        dataRequested: fnDataRequested,
                        dataReceived: fnDataReceived
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