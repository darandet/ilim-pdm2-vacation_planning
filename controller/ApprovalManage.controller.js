sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/PlanCreate.controller",
    "sap/ui/model/json/JSONModel",
    "jquery.sap.global",
    "sap/ui/model/Filter",
    "ilim/pdm2/vacation_planning/utils/managerController",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "ilim/pdm2/vacation_planning/model/formatter"
], function (Controller, JSONModel, $, Filter, managerController, MessageBox, Dialog, Button, Formatter) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.ApprovalManage", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalManage
         */

        selectedEmployees: [],
        oManagerController: {},

        formatter: Formatter,

        onInit: function() {

            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.subscribe("managerHeaderChanges", "yearSelection", this._filterInboxByYear, this);

            this.getRouter().getRoute("ManageApprovals").attachPatternMatched(this._patternMatched, this);

            this.oManagerController = this.getOwnerComponent().oManagerController;

        },

        onShowSelected: function (oEvent) {

            var oList  = this.getView().byId("inboxTable");
            var oModel = this.getModel("oData");

            this.oManagerController.setSelectedEmployees(oList.getSelectedContextPaths());

            this.getRouter().navTo("ApprovalDetails");
        },
        
        onShowExcel: function (oEvent) {

          //Передаем "от лица" через ProjPernr, даты через Ename и Pltxt
          var sUrl = "/sap/opu/odata/sap/ZHR_PDM_VACATION_PLANNING_SRV/ManagingPeriodsSet(PlanYear='2018',OnlySubord='')/ToInbox?$format=xlsx";
          var encodeUrl = encodeURI(sUrl);
          sap.m.URLHelper.redirect(encodeUrl, true);

        },

        onEmployeeSearch: function (oEvent) {

            var aFilters = [];
            var sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {

                aFilters = this.oManagerController.getComplexFilter(sQuery);
                var filter = new Filter({filters: aFilters, and: true});

                // update list binding
                var list = this.getView().byId("inboxTable");
                var binding = list.getBinding("items");
                binding.filter(filter);
            }

        },
        
        _getFilterDialog : function () {
          if (!this._oDialog) {
            this._oDialog = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.FilterDialog", this);
            this.getView().addDependent(this._oDialog);
          }
          return this._oDialog;
        },

        handleConfirm: function (oEvent) {
          if (oEvent.getParameters().filterString) {
            sap.m.MessageToast.show(oEvent.getParameters().filterString);
          }
        },

        onFilterPress: function (oEvent) {
          this._getFilterDialog().open();
        },        

        onApprovePlan: function (oEvent) {
          this.onApproveInbox(oEvent, "VPL");
        },

        onApproveTransfer: function (oEvent) {
          this.onApproveInbox(oEvent, "TRQ");
        },

        onApproveConfirm: function (oEvent) {
          this.onApproveInbox(oEvent, "CRQ");
        },

        onApproveInbox: function(oEvent, sType) {

            var oSource         = oEvent.getSource();
            var sCtxPath        = oSource.getParent().getBindingContext("oData").getPath(); //Button -> Item
            var oCurrentCtxObj  = this.getModel("oData").getObject(sCtxPath);

            var that = this;

            if (!this.approveCommentDialog) {

                var oComment = {
                    Comment: "",
                    InboxType: sType
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

                            var oCommentModel = that.approveCommentDialog.getModel("comment");
                            var sReqType      = oCommentModel.getProperty("/InboxType");
                            oCurrentCtxObj.comment = oCommentModel.getProperty("/Comment");

                            that._callActionOnPlan(oCurrentCtxObj, "APROV", sReqType);

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
        },

        onRejectPlan: function (oEvent) {
          this.onRejectInbox(oEvent, "VPL")
        },

        onRejectTransfer: function (oEvent) {
          this.onRejectInbox(oEvent, "TRQ")
        },

        onRejectConfirm: function (oEvent) {
          this.onRejectInbox(oEvent, "CRQ")
        },

        onRejectInbox: function (oEvent, sType) {

            var oSource         = oEvent.getSource();
            var sCtxPath        = oSource.getParent().getBindingContext("oData").getPath(); //Button -> Item
            var oCurrentCtxObj  = this.getModel("oData").getObject(sCtxPath);

            var that = this;

            if (!this.rejectCommentDialog) {

                var oComment = {
                    Comment: "",
                    ReqType: sType
                };

                var oDialogFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.CommentsDialog");
                var oCommentModel = new JSONModel(oComment);
                this.rejectCommentDialog = new Dialog({
                    title: this.getResourceBundle().getText("common.commentsDialog.Title"),
                    draggable: true,
                    content: oDialogFragment,
                    type: 'Message',
                    beginButton: new Button({
                        text: this.getResourceBundle().getText("common.commentsDialog.CancelButton"),
                        press: function () {
                            that.rejectCommentDialog.close();
                        }
                    }),
                    endButton: new Button({
                        text: this.getResourceBundle().getText("common.commentsDialog.SendButton"),
                        press: function () {

                            var oCommentModel = that.rejectCommentDialog.getModel("comment");
                            var sReqType      = oCommentModel.getProperty("/ReqType");
                            oCurrentCtxObj.comment = oCommentModel.getProperty("/Comment");

                            that._callActionOnPlan(oCurrentCtxObj, "REJEC", sReqType);

                            oCommentModel.setProperty("/Comment", "");
                            that.rejectCommentDialog.close();
                        }
                    }),
                    afterClose: function() {
                        that.rejectCommentDialog.destroy();
                        that.rejectCommentDialog = undefined;
                    }                    

                });
                this.rejectCommentDialog.setModel(oCommentModel, "comment");
                this.getView().addDependent(this.rejectCommentDialog);


            }

            this.rejectCommentDialog.open();
        },

        onShowComments: function (oEvent) {
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

            var oSource         = oEvent.getSource();
            var sCtxPath        = oSource.getParent().getBindingContext("oData").getPath(); //Button -> Item
            that._planComments.bindElement({
                path: sCtxPath,
                model: "oData"
            });
            that._planComments.open();

        },

        onShowPlanForm: function (oEvent) {
            var oSource         = oEvent.getSource();
            var sCtxPath        = oSource.getParent().getBindingContext("oData").getPath(); //Button -> Item
            var oCtxObject      = this.getModel("oData").getObject(sCtxPath);

            var that = this;
            if (!that.planCreationForm) {
                var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;

                var prefix = this.getView().createId("").replace("--",""); //to use getView().byId() on fragment elements
                var oPlanView = sap.ui.xmlfragment(prefix, "ilim.pdm2.vacation_planning.view.fragments.PlanForm", this);
                that.planCreationForm = new Dialog({
                    title: this.getResourceBundle().getText("vacation.footer.button.vacationPlan"),
                    contextWidth: '70%',
                    resizable: true,
                    draggable: true,
                    content: oPlanView,
                    beginButton: new Button({
                        text: this.getResourceBundle().getText("common.commentsDialog.CancelButton"),
                        press: function () {
                            that.planCreationForm.close();
                        }
                    }),
                    endButton: new Button({
                        text: this.getResourceBundle().getText("vacations.footer.button.sendPlan"),
                        type: "Accept",
                        press: function () {
                            this.planCreationForm.close();
                            this._sendPlanOnBehalf();
                        }.bind(this)
                    })
                });

                if (bCompact) {
                    that.planCreationForm.addStyleClass("sapUiSizeCompact");
                }
                that.getView().addDependent(that.planCreationForm);
            }

            var sPlanPath = "/VacationPlanHdrSet(PlanYear='" + oCtxObject.PlanYear + "',Pernr='" + oCtxObject.EmployeeId + "')";
            var oBindingContext = new sap.ui.model.Context(this.getModel("oData"), sPlanPath);
            this.planCreationForm.setBindingContext(oBindingContext, "oData");
            this.planCreationForm.bindElement({
                path: sPlanPath,
                parameters: {
                    expand: "ToVacations"
                },
                model: "oData"
            });
            that.planCreationForm.open();

        },

        _sendPlanOnBehalf: function () {

            var that = this;

            var fnHandleSuccess = function (oData, response) {
                var oTable = this.getView().byId("inboxTable");
                var oTableBinding = oTable.getBinding("items");

                oTableBinding.refresh();
            }.bind(this);

            if (!this.onBehalfCommentDialog) {

                var oComment = {
                    Comment: ""
                };

                var oDialogFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.CommentsDialog");
                var oCommentModel = new JSONModel(oComment);
                this.onBehalfCommentDialog = new Dialog({
                    title: this.getResourceBundle().getText("common.commentsDialog.Title"),
                    draggable: true,
                    content: oDialogFragment,
                    type: "Message",
                    beginButton: new Button({
                        text: this.getResourceBundle().getText("common.commentsDialog.CancelButton"),
                        press: function () {
                            that.onBehalfCommentDialog.close()
                        }
                    }),
                    endButton: new Button({
                        text: this.getResourceBundle().getText("common.commentsDialog.SendButton"),
                        press: function () {
                            var oCommentModel   = that.onBehalfCommentDialog.getModel("comment");
                            var oDataModel      = that.getModel("oData");
                            var sPlanPath       = that.planCreationForm.getBindingContext("oData").getPath();
                            var oCurrentCtxObj  = oDataModel.getObject(sPlanPath);

                            oDataModel.callFunction("/ActionOnVacationPlan", {
                                method: "POST",
                                urlParameters: {
                                    Action:     "SDLM",
                                    EmployeeId: oCurrentCtxObj.Pernr,
                                    PlanYear:   oCurrentCtxObj.PlanYear,
                                    Comment:    oCommentModel.getProperty("/Comment")
                                },
                                success: fnHandleSuccess
                            });

                            oCommentModel.setProperty("/Comment", "");
                            that.onBehalfCommentDialog.close();
                        }
                    })
                });

                this.onBehalfCommentDialog.setModel(oCommentModel, "comment");
                this.getView().addDependent(this.onBehalfCommentDialog);
            }

            this.onBehalfCommentDialog.open();

        },

        _callActionOnPlan: function (oContextObject, Action, sType) {

            var oDataModel = this.getView().getModel("oData");

            var fnHandleSuccess = function (oData, response) {
                if (sType === "CRQ") {
                    var oTable = this.getView().byId("confirmTable");
                } else if (sType === "TRQ") {
                    var oTable = this.getView().byId("transferTable");                    
                } else {
                    var oTable = this.getView().byId("inboxTable");                    
                }                
                var oTableBinding = oTable.getBinding("items");

                oTableBinding.refresh();
            }.bind(this);
            
            if (sType === "CRQ" || sType === "TRQ")
            {
              oDataModel.callFunction("/ActionOnRequest", {
                  method: "POST",
                  urlParameters: {
                      Action:      Action,
                      RequestId:   oContextObject.RequestId,
                      RequestType: sType,
                      Comment:     oContextObject.comment
                  },
                  success: fnHandleSuccess
                  // error: fnHandleError
              });
            } else {
              oDataModel.callFunction("/ActionOnVacationPlan", {
                  method: "POST",
                  urlParameters: {
                      Action:     Action,
                      EmployeeId: oContextObject.EmployeeId,
                      PlanYear:   oContextObject.PlanYear,
                      Comment:    oContextObject.comment
                  },
                  success: fnHandleSuccess
                  // error: fnHandleError
              });
            }            

        },

        _filterInboxByYear: function (sChannel, sEvent, oData) {

            //Очистить поле поиска сотрудника
            var oSearchField = this.getView().byId("inboxEmployeeSearchField");
            oSearchField.setValue("");

        },

        _patternMatched: function () {

            var that      = this;
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.publish("childNavigation", "syncViews", { key: "approvalTab" });            

            this.getOwnerComponent().oRolesLoaded.then( function (oData) {
                if (!oData.CanApprove) {
                    that.getRouter().navTo("NoAuthorization");
            //     } else {
            //         if (that.oManagerController.getCurrentYear()) {
            //             that._filterInboxByYear(null, null, {PlanYear: that.oManagerController.getCurrentYear()});
            //         } else {
            //
            //             that.oManagerController.oWhenPeriodIsLoaded.then( function (oData) {
            //
            //                 that._filterInboxByYear(null, null, oData);
            //
            //             });
            //         }
                }
            });

            if (this.oManagerController.getSelectedEmployees()) {
                this.getView().byId("inboxTable").setSelectedContextPaths(this.oManagerController.getSelectedEmployees());
            }
        }

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf ilim.pdm2.vacation_planning.ApprovalManager
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalManager
         */
        //	onAfterRendering: function() {
        //
        //	},

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalManager
         */
        //	onExit: function() {
        //
        //	}
    });

});
