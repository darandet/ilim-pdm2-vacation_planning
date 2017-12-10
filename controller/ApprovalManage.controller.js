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
            this.iRowsToProcess = 1;
            this.iRowsProcessed = 0;
        },

        onShowSelected: function (oEvent) {

            var oList  = this.getView().byId("inboxTable");
            var oModel = this.getModel("oData");

            this.oManagerController.setSelectedEmployees(oList.getSelectedContextPaths());

            this.getRouter().navTo("ApprovalDetails");
        },
        
        onShowExcel: function (oEvent) {

          var sPlanYear = this.oManagerController.getCurrentYear();
          var sSubord   = this.oManagerController.getOnlySubord();
          var sUrl      = "/sap/opu/odata/sap/ZHR_PDM_VACATION_PLANNING_SRV/VacationPlanXLSSet?$filter=Bukrs eq '" + 
                              sPlanYear +
                              "' and HasAccess eq '" +
                              sSubord +
                              "'&$format=xlsx";    
          var encodeUrl = encodeURI(sUrl);
          sap.m.URLHelper.redirect(encodeUrl, true);

        },

        onEmployeeSearch: function (oEvent) {

            this.oManagerController.setSearchline(oEvent.getSource().getValue());
            var aFilters = this.oManagerController.getComplexFilter();
            
            switch (this.oManagerController.getCurrentTab()) {
              case "plan":
                this.getView().byId("inboxTable").getBinding("items").filter(aFilters);
                break;
              case "tran":
                this.getView().byId("transferTable").getBinding("items").filter(aFilters);
                break;
              case "conf":
                this.getView().byId("confirmTable").getBinding("items").filter(aFilters);
                break;
            }
        },
        
        onTabSelect: function (oEvent) {

          this.oManagerController.setCurrentTab(oEvent.getSource().getSelectedKey());
        },

        _getTransFilterDialog: function () {

          if (!this._oTransDialog) {
            this._oTransDialog = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.TransferFilterDialog", this);
            this.getView().addDependent(this._oTransDialog);
          }

          return this._oTransDialog;
        },

        _getPlanFilterDialog : function () {

          if (!this._oPlanDialog) {
            this._oPlanDialog = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.PlanFilterDialog", this);
            this.getView().addDependent(this._oPlanDialog);
          }

          return this._oPlanDialog;
        },

        _getConfFilterDialog : function () {

          if (!this._oConfDialog) {
            this._oConfDialog = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.ConfirmFilterDialog", this);
            this.getView().addDependent(this._oConfDialog);
          }

          return this._oConfDialog;
        },

        handleConfirm: function (oEvent) {
          this.oManagerController.clearFilters();

          if (oEvent.getParameters().filterString) {

              var aFilters = oEvent.getParameters().filterItems;

              for (var i=0; i < aFilters.length; i++) {
                  var val = aFilters[i].getKey();
                  var key = aFilters[i].getParent().getKey();

                  switch (key) {
                      case "Manager":
                        this.oManagerController.addManagerVal(val);
                        break;
                      case "Department":
                        this.oManagerController.addDepartVal(val);
                        break;
                      case "Status":
                        this.oManagerController.addStatusVal(val);
                        break;
                  }
              }

              sap.m.MessageToast.show(oEvent.getParameters().filterString);
          }

          var aFilters = this.oManagerController.getComplexFilter();
            
          switch (this.oManagerController.getCurrentTab())
          {
            case "plan":
              this.getView().byId("inboxTable").getBinding("items").filter(aFilters);
              break;
            case "tran":
              this.getView().byId("transferTable").getBinding("items").filter(aFilters);
              break;
            case "conf":
              this.getView().byId("confirmTable").getBinding("items").filter(aFilters);
              break;
          }
        },

        onFilterPress: function (oEvent) {
          switch (this.oManagerController.getCurrentTab()) {
            case "plan":
              this._getPlanFilterDialog().open();
              break;
            case "tran":
              this._getTransFilterDialog().open();
              break;
            case "conf":
              this._getConfFilterDialog().open();
              break;
          }
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
        
        onMassApprovePlan: function (oEvent) {
          this.onMassApprove(oEvent, "VPL");

        },

        onMassApproveTransfer: function (oEvent) {
          this.onMassApprove(oEvent, "TRQ");

        },

        onMassApproveConfirm: function (oEvent) {
          this.onMassApprove(oEvent, "CRQ");

        },

        onMassApprove: function(oEvent, sType) {

            var aItemsSelected  = oEvent.getSource().getParent().getParent().getSelectedItems();
            var aItemsToApprove = [];
            var that            = this;

            for (var i = 0; i < aItemsSelected.length; i++) {
                var sCtxPath        = aItemsSelected[i].getBindingContext("oData").getPath();
                var oCurrentCtxObj  = aItemsSelected[i].getModel("oData").getObject(sCtxPath);
                if ( oCurrentCtxObj.CanApprove == true ) {
                  aItemsToApprove.push(oCurrentCtxObj);
                }
            }

            if (aItemsToApprove.length > 0) {

                this.iRowsToProcess = aItemsToApprove.length;                
                
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

                                for (var i = 0; i < aItemsToApprove.length; i++) {
                                    var oCurrentCtxObj     = aItemsToApprove[i];
                                    oCurrentCtxObj.comment = oCommentModel.getProperty("/Comment");
                                    that._callActionOnPlan(oCurrentCtxObj, "APROV", sReqType);
                                }

                                oCommentModel.setProperty("/comment", "");
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

            } else {
                sap.m.MessageToast.show(this.getResourceBundle().getText("common.massApprove.NothingSelected"));
            }
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

                switch (that.oManagerController.getCurrentTab()) {
                  case "plan":
                    var oFormFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.PlanComments");
                    break;
                  case "tran":
                    var oFormFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.TransComments");
                    break;
                  case "conf":
                    var oFormFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.ConfComments");
                    break;
                }

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
                    }),
                    afterClose: function() {
                        that._planComments.destroy();
                        that._planComments = undefined;
                    }                    
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

                this.iRowsProcessed++;

                if (this.iRowsProcessed >= this.iRowsToProcess) {
                    if (sType === "CRQ") {
                        var oTable = this.getView().byId("confirmTable");
                    } else if (sType === "TRQ") {
                        var oTable = this.getView().byId("transferTable");
                    } else {
                        var oTable = this.getView().byId("inboxTable");
                    }
                    var oTableBinding = oTable.getBinding("items");

                    oTableBinding.refresh();
                    this.iRowsToProcess = 1;
                    this.iRowsProcessed = 0;
                }
            }.bind(this);
            
            var fnHandleError = function (oData, response) {

                this.iRowsProcessed++;

                if (this.iRowsProcessed >= this.iRowsToProcess && this.iRowsToProcess > 1) {
                    if (sType === "CRQ") {
                        var oTable = this.getView().byId("confirmTable");
                    } else if (sType === "TRQ") {
                        var oTable = this.getView().byId("transferTable");
                    } else {
                        var oTable = this.getView().byId("inboxTable");
                    }
                    var oTableBinding = oTable.getBinding("items");

                    oTableBinding.refresh();
                    this.iRowsToProcess = 1;
                    this.iRowsProcessed = 0;
                }
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
                  groupId: oContextObject.RequestId,                  
                  success: fnHandleSuccess,
                  error: fnHandleError
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
                  groupId: oContextObject.EmployeeId,                  
                  success: fnHandleSuccess,
                  error: fnHandleError
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
