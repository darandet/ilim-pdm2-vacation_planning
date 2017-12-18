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
            if (!that._planComments) {

                var oFormFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.PlanComments");

                that._planComments = new Dialog({
                    title: that.getResourceBundle().getText("vacation.comments.Header"),
                    contentWidth: "35%",
                    draggable: true,
                    content: oFormFragment,
                    endButton: new Button({
                        text: that.getResourceBundle().getText("common.dialog.button.close"),
                        press: function () {
                            that._planComments.close();
                        }
                    })
                });

                //to get access to the global model
                that.getView().addDependent(that._planComments);

            }

            var sPlanPath = that.getView().getBindingContext("oData").getPath();
            that._planComments.bindElement({
                path: sPlanPath,
                model: "oData"
            });
            that._planComments.open();
        },

        onShowHistory: function () {

            var crossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
            var extendUrl = "ZApprovalHistorySem-display&/PlanVac";
            crossAppNav.toExternal({
                target: { shellHash: extendUrl }
            })
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
            var sCurrentPath = this.getView().getBindingContext("oData").getPath();
            
            var aVacations = this._convertModelVacationsToArray(oDataModel, sCurrentPath);
            
            this._checkVacationsBeforeSend(aVacations);
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
                        expand: "ToVacations,ToAbsenceRight,ToApprRoute,ToHolidays"
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

        },

        _convertModelVacationsToArray: function (oModel, sPath) {

            var aVacationsKeys = oModel.getData(sPath + "/ToVacations");
            var aVacations = [];

            for (var i=0; i < aVacationsKeys.length; i++) {
                if (oModel.getObject("/" + aVacationsKeys[i])) {
                    aVacations.push(oModel.getObject("/" + aVacationsKeys[i]));
                }
            }

            return aVacations;

        },

        _checkVacationsBeforeSend: function (aVacations) {

            var bHas2Week = false;
            var bHas1Week = false;
            var N = 1000*60*60*24;
            var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;


            var fnDateDiff = function (Date1, Date2) {
                return Math.round((Date2 - Date1)/N) + 1;
            };

            for(var i=0; i < aVacations.length; i++) {
                if (fnDateDiff(aVacations[i].BeginDate, aVacations[i].EndDate) >= 14) {
                    bHas2Week = true;
                }

            }

            if (!bHas2Week) {
                MessageBox.error(
                    this.getResourceBundle().getText("vacation.checks.no2WeekMessage"),
                    {
                        styleClass: bCompact ? "sapUiSizeCompact" : ""
                    }
                );
            } else {
                this._sendPlan();
            }

        },

        _showWarnings: function (bHas1Week, bHas2Week) {

            var sNo1WeekVacation = "<li>" + this.getResourceBundle().getText("vacation.checks.no1WeekMessage") + "</li>";
            var sNo2WeekVacation = "<li>" + this.getResourceBundle().getText("vacation.checks.no2WeekMessage") + "</li>";

            var sMessageText = "<p><strong>" + this.getResourceBundle().getText("vacation.checks.commonTextDetailed") + "</strong></p>\n<ul>";
            var sFinalQuestion = "<p>" + this.getResourceBundle().getText("vacation.checks.finalQuestion") + "</p>";

            if (!bHas1Week) {
                sMessageText = sMessageText + sNo1WeekVacation;
            }

            if (!bHas2Week) {
                sMessageText = sMessageText + sNo2WeekVacation;
            }

            sMessageText = sMessageText + "</ul>";
            sMessageText = sMessageText + sFinalQuestion;

            var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

            var oWarningDialog = new Dialog({
                type: sap.m.DialogType.Warning,
                title: this.getResourceBundle().getText("vacation.checks.commonText"),
                state: "Warning",
                content: new sap.m.FormattedText({
                    htmlText: sMessageText
                }),
                beginButton: new Button({
                    text: this.getResourceBundle().getText("vacation.checks.YesButton"),
                    press: function () {
                        oWarningDialog.close();
                        this._sendPlan()
                    }.bind(this)
                }),
                endButton: new Button({
                    text: this.getResourceBundle().getText("vacation.checks.NoButton"),
                    press: function () {
                        oWarningDialog.close();
                    }
                }),
                afterClose: function () {
                    oWarningDialog.destroy();
                }
            });

            oWarningDialog.addStyleClass("sapUiContentPadding");
            oWarningDialog.open();
        },
        
        _sendPlan: function () {

            var oDataModel = this.getModel("oData");
            var sCurrentCtxPath = this.getView().getBindingContext("oData").getPath();
            var oCurrentCtxObj = oDataModel.getObject(sCurrentCtxPath);
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
                    Comment: ""
                };

                var oDialogFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.CommentsDialog");
                var oCommentModel = new JSONModel(oComment);
                this.approveCommentDialog = new Dialog({
                    title: this.getResourceBundle().getText("common.commentsDialog.Title"),
                    draggable: true,
                    content: oDialogFragment,
                    type: 'Message',
                    beginButton: new Button({
                        text: this.getResourceBundle().getText("common.commentsDialog.CancelButton"),
                        press: function () {
                            that.approveCommentDialog.close();
                        }
                    }),
                    endButton: new Button({
                        text: this.getResourceBundle().getText("common.commentsDialog.SendButton"),
                        press: function () {

                            that.getModel("screenState").setProperty("/busy", true);

                            var oCommentModel = that.approveCommentDialog.getModel("comment");
                            oDataModel.callFunction("/ActionOnVacationPlan", {
                                method: "POST",
                                urlParameters: {
                                    EmployeeId: oCurrentCtxObj.Pernr,
                                    PlanYear:   oCurrentCtxObj.PlanYear,
                                    Action:     "SEND",
                                    Comment:    oCommentModel.getProperty("/Comment")
                                },
                                success: fnHandleSuccess,
                                error: fnHandleError
                            });

                            oCommentModel.setProperty("/Comment", "");
                            that.approveCommentDialog.close();
                        }
                    })

                });
                this.approveCommentDialog.setModel(oCommentModel, "comment");
                this.getView().addDependent(this.approveCommentDialog);


            }

            this.approveCommentDialog.open();
            
        }

    });

});