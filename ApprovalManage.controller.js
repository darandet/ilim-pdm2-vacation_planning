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
            this.aItemsToHRCr   = [];

        },

        onShowSelected: function (oEvent) {

            var oList  = this.getView().byId("inboxTable");
            //var oModel = this.getModel("oData");

            var aItems = oList.getSelectedItems();
            var aPaths = [];

            for (var i=0; i < aItems.length; i++) {
               aPaths.push(aItems[i].getBindingContextPath());
            }

            //this.oManagerController.setSelectedEmployees(oList.getSelectedContextPaths());
            this.oManagerController.setSelectedEmployees(aPaths);

            this.getRouter().navTo("ApprovalDetails");
        },

        onShowExcel: function (oEvent) {

          var sPlanYear = this.oManagerController.getCurrentYear();
          var sSubord   = this.oManagerController.getOnlySubord();
          var sEmplId   = this.oManagerController.getPEmployeeId();
          var sEmplName = this.oManagerController.getPEmployeeNameUp();
          var aStatus   = this.oManagerController.getPStatuses();
          var aAccess   = this.oManagerController.getPAccess();
          var aDepart   = this.oManagerController.getPDepartments();
          var aManager  = this.oManagerController.getPManagers();
          var sUrl      = "/sap/opu/odata/sap/ZHR_PDM_VACATION_PLANNING_SRV/VacationPlanXLSSet?$format=xlsx&$filter=(Btrtx eq '" +
                              sPlanYear +
                              "' and HasAccess eq '" +
                              sSubord +
                              "'";

          if (sEmplId) {
              sUrl += " and EmployeeId eq '" + sEmplId + "'";
          }

          if (sEmplName) {
              sUrl += " and EmployeeName eq '" + sEmplName + "'";
          }

          if (aAccess.length === 1) {
              if (aAccess[0] === true) {
                  sUrl += " and PositionName eq '1'";
              } else {
                  sUrl += " and PositionName eq '2'";
              }
          }

          sUrl += this._getFilterArrayUrl(aStatus,  'Status');
          sUrl += this._getFilterArrayUrl(aDepart,  'OrganizationName');
          sUrl += this._getFilterArrayUrl(aManager, 'ChperEname');
          sUrl += ")";

          var encodeUrl = encodeURI(sUrl);
          sap.m.URLHelper.redirect(encodeUrl, true);

        },

        _getFilterArrayUrl: function (aFilter, fieldName) {

          var ret = "";

          if (aFilter.length > 0) {
              if (aFilter.length === 1) {
                  ret = " and " + fieldName + " eq '" + aFilter[0] + "'";
              } else {
                  ret = " and (" + fieldName + " eq '" + aFilter[0] + "'";
                  for (var i=1; i < aFilter.length; i++) {
                     ret += " or " + fieldName + " eq '" + aFilter[i] + "'";
                  }
                  ret += ")";
              }
          }

          return ret;

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
                      case "Access":
                          this.oManagerController.addAccessVal(val);
                          break;
                  }
              }

              sap.m.MessageToast.show(oEvent.getParameters().filterString);
          }

          switch (this.oManagerController.getCurrentTab())
          {
            case "plan":
              this.getView().byId("inboxTable").getBinding("items").filter(this.oManagerController.getComplexFilter());
              break;
            case "tran":
              this.getView().byId("transferTable").getBinding("items").filter(this.oManagerController.getComplexFilter());
              break;
            case "conf":
              this.getView().byId("confirmTable").getBinding("items").filter(this.oManagerController.getComplexFilter());
              break;
          }

        },

        onFilterPress: function (oEvent) {

          switch (this.oManagerController.getCurrentTab())
          {
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

        getSType: function () {

            var sType = "VPL";

            switch (this.oManagerController.getCurrentTab())
            {
              case "plan":
                sType = "VPL";
                break;
              case "tran":
                sType = "TRQ";
                break;
              case "conf":
                sType = "CRQ";
                break;
            }

            return sType;
        },

        onMassApprove: function(oEvent) {

            var aItemsSelected  = oEvent.getSource().getParent().getParent().getParent().getSelectedItems();
            var aItemsToApprove = [];
            var that            = this;
            var sType           = this.getSType();
            var sOper           = "APROV";

            if (oEvent.getParameters().item.getProperty("icon") === "sap-icon://decline") {
                sOper = "REJEC";
            } else {
                sOper = "APROV";
            }


            for (var i = 0; i < aItemsSelected.length; i++) {
                var sCtxPath        = aItemsSelected[i].getBindingContext("oData").getPath();
                var oCurrentCtxObj  = aItemsSelected[i].getModel("oData").getObject(sCtxPath);
                if (( sOper === "APROV" && oCurrentCtxObj.CanApprove !== '' ) ||
                    ( sOper === "REJEC" && oCurrentCtxObj.CanReject !== ''  )) {
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
                                    that._callActionOnPlan(oCurrentCtxObj, sOper, sReqType);
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

        onApproveInbox: function(oEvent) {

            var oSource        = oEvent.getSource();
            var sCtxPath       = oSource.getParent().getBindingContext("oData").getPath(); //Button -> Item
            var oCurrentCtxObj = this.getModel("oData").getObject(sCtxPath);
            var sType          = this.getSType();
            var that           = this;

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
        },

        onRejectInbox: function (oEvent) {

            var oSource        = oEvent.getSource();
            var sCtxPath       = oSource.getParent().getBindingContext("oData").getPath(); //Button -> Item
            var oCurrentCtxObj = this.getModel("oData").getObject(sCtxPath);
            var sType          = this.getSType();
            var that           = this;

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
            var oFormFragment;

            if (!that._planComments) {

                switch (that.oManagerController.getCurrentTab()) {
                  case "plan":
                    oFormFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.PlanComments");
                    break;
                  case "tran":
                    oFormFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.TransComments");
                    break;
                  case "conf":
                    oFormFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.ConfComments");
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
            var that            = this;

            if (!that.planCreationForm) {

                var bCompact  = !!this.getView().$().closest(".sapUiSizeCompact").length;
                var prefix    = this.getView().createId("").replace("--",""); //to use getView().byId() on fragment elements
                var oPlanView = sap.ui.xmlfragment(prefix, "ilim.pdm2.vacation_planning.view.fragments.PlanFormDialog", this);

                that.planCreationForm = new Dialog({
                    title: this.getResourceBundle().getText("vacation.footer.button.vacationPlan"),
                    contentWidth: "70%",
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
                        text: this.getResourceBundle().getText("vacation.footer.button.sendPlan"),
                        type: "Accept",
                        press: function () {
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
                    expand: "ToVacations,ToHolidays,ToAbsenceRight"
                },
                model: "oData"
            });
            that.planCreationForm.open();

        },


        onAddVacation: function (oEvent) {

            var oDateRangeInput = this.getView().byId("VacationRangeInput");
            var oCalendar       = this.getView().byId("calendar");

            if (!oDateRangeInput.getDateValue()) {
                this._showErrorInContainer(this.getResourceBundle().getText("vacation.create.wrongDates"));

                return;
            }

            var sBindingPath = this.planCreationForm.getBindingContext("oData").getPath();
            var oContextObj = this.getModel("oData").getObject(sBindingPath);
            this._addVacationToPlan(
                oContextObj.PlanYear, oContextObj.Pernr,
                oDateRangeInput.getDateValue(), oDateRangeInput.getSecondDateValue()
            );

            oDateRangeInput.setDateValue();
            oCalendar.removeAllSelectedDates();

        },


        _sendPlanOnBehalf: function () {

            var that = this;

            var fnHandleSuccess = function (oData, response) {

                this.planCreationForm.setBusy(false);
                this.planCreationForm.close();
                this._refreshTableBinding("inboxTable");
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

                            this.planCreationForm.setBusy(true);

                            oDataModel.callFunction("/ActionOnVacationPlan", {
                                method: "POST",
                                urlParameters: {
                                    Action:     "SDLM",
                                    EmployeeId: oCurrentCtxObj.Pernr,
                                    PlanYear:   oCurrentCtxObj.PlanYear,
                                    Comment:    oCommentModel.getProperty("/Comment")
                                },
                                success: fnHandleSuccess,
                                error: function (oError) {
                                    this.planCreationForm.setBusy(false);
                                    this._showErrorInContainer(oError);
                                }.bind(this)
                            });

                            oCommentModel.setProperty("/Comment", "");
                            this.onBehalfCommentDialog.close();

                        }.bind(this)
                    }),
                    afterClose: function() {
                        that.onBehalfCommentDialog.destroy();
                        that.onBehalfCommentDialog = undefined;
                    }
                });

                this.onBehalfCommentDialog.setModel(oCommentModel, "comment");
                this.getView().addDependent(this.onBehalfCommentDialog);
            }

            this.onBehalfCommentDialog.open();

        },

        _callActionOnPlan: function (oContextObject, Action, sType) {

            var oDataModel = this.getView().getModel("oData");

            var fnHandleSuccess = function (oData, response) {
                var oTable;
                this.iRowsProcessed++;

                // Создание кадрового мероприятия
                if (sType === "CRQ" && oContextObject.PlanStatus === "VP08" && Action === "APROV") {
                    this.aItemsToHRCr.push(oContextObject);
                }

                if (this.iRowsProcessed >= this.iRowsToProcess) {
                    if (sType === "CRQ") {
                        if (this.aItemsToHRCr.length > 0) {
                            this.createHRActions();
                        } else {
                            this._refreshTableBinding("confirmTable");
                        }
                    } else if (sType === "TRQ") {
                        this._refreshTableBinding("transferTable");
                    } else {
                        this._refreshTableBinding("inboxTable");
                    }

                    this.iRowsToProcess = 1;
                    this.iRowsProcessed = 0;
                }

            }.bind(this);

            var fnHandleError = function (oError) {
                this.iRowsProcessed++;

                if (this.iRowsToProcess === 1) {
                    this._showErrorInBox(oError);
                    return;
                }

                if (this.iRowsProcessed >= this.iRowsToProcess && this.iRowsToProcess > 1) {
                    if (sType === "CRQ") {
                        this._refreshTableBinding("confirmTable");
                    } else if (sType === "TRQ") {
                        this._refreshTableBinding("transferTable");
                    } else {
                        this._refreshTableBinding("inboxTable");
                    }

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
                  error:   fnHandleError
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
                  error:   fnHandleError
              });
            }

        },

        createHRActions: function () {

            var that        = this;
            var oContextObj = {};

            if ( this.aItemsToHRCr.length > 0 ) {
                this.getView().setBusy(true);
                oContextObj = this.aItemsToHRCr[0];
            } else {
                this.getView().setBusy(false);
                return;
            }

            var fnHandleSuccess = function (oData, response) {

                if ( this.aItemsToHRCr.length > 0 ) {
                    this.aItemsToHRCr.splice(0, 1);
                }

                if ( this.aItemsToHRCr.length > 0 ) {
                    this.createHRActions();
                } else {
                    this._refreshTableBinding("confirmTable");
                    this.getView().setBusy(false);
                }
            }.bind(this);

            var fnHandleError = function (oError) {

                this._showErrorInBox(oError);

                if ( this.aItemsToHRCr.length > 0 ) {
                    this.aItemsToHRCr.splice(0, 1);
                }

                if ( this.aItemsToHRCr.length > 0 ) {
                    this.createHRActions();
                } else {
                    this._refreshTableBinding("confirmTable", true);
                    this.getView().setBusy(false);
                }
            }.bind(this);

            if (!this.oHRActionDialog) {

                var oHRAction = {
                    HRBossId:    oContextObj.HrBossId,
                    OrderDate:   this.formatter.dateToString(oContextObj.BeginDate),
                    OrderNum:    "",
                    HRBossName:  oContextObj.HrBossName,
                    EmplName:    oContextObj.EmployeeName,
                    Begda:       this.formatter.dateToString(oContextObj.BeginDate),
                    Endda:       this.formatter.dateToString(oContextObj.EndDate),
                    CreO:        true,
                    CreG:        false,
                    IncG:        false,
                    EditDate:    true,
                    StartDate:   this.formatter.dateToString(oContextObj.BeginDate),
                    OrderRemark: oContextObj.RequestId
                };

                var oDialogFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.HRActionDialog", this);
                var oHRActionModel  = new JSONModel(oHRAction);
                var oDataModel      = this.getModel("oData");

                this.oHRActionDialog = new Dialog({
                    title: this.getResourceBundle().getText("common.hrActionDialog.Title"),
                    draggable: true,
                    content: oDialogFragment,
                    type: "Message",
                    endButton: new Button({
                        text: this.getResourceBundle().getText("common.hrActionDialog.executeButton"),
                        press: function () {
                            var oHRActionModel  = that.oHRActionDialog.getModel("action");
                            var sAction         = "CREO";

                            if (oHRActionModel.getProperty("/CreO") === true ) {
                                sAction = "CREO";
                            } else {
                                if (oHRActionModel.getProperty("/CreG") === true ) {
                                    sAction = "CREG";
                                } else {
                                    sAction = "INCG";
                                }
                            }

                            oDataModel.callFunction("/CreateHRActions", {
                                method: "POST",
                                urlParameters: {
                                    Action:      sAction,
                                    HRBossId:    oHRActionModel.getProperty("/HRBossId"),
                                    OrderDate:   oHRActionModel.getProperty("/OrderDate"),
                                    OrderNum:    oHRActionModel.getProperty("/OrderNum"),
                                    OrderRemark: oHRActionModel.getProperty("/OrderRemark")
                                },
                                groupId: oContextObj.RequestId,
                                success: fnHandleSuccess,
                                error:   fnHandleError
                            });

                            oHRActionModel.setProperty("/OrderNum", "");
                            oHRActionModel.setProperty("/EditDate", true);
                            oHRActionModel.setProperty("/CreO", true);
                            oHRActionModel.setProperty("/CreG", false);
                            oHRActionModel.setProperty("/IncG", false);
                            this.oHRActionDialog.close();

                        }.bind(this)
                    }),
                    afterClose: function() {
                        if (that.aItemsToHRCr.length <= 0) {
                            that.oHRActionDialog.destroy();
                            that.oHRActionDialog = undefined;
                            that.getView().setBusy(false);
                            that._refreshTableBinding("confirmTable", true);
                        }
                    }
                });

                this.oHRActionDialog.setModel(oHRActionModel, "action");
                this.getView().addDependent(this.oHRActionDialog);
            } else {

                var oHRActionModel = this.oHRActionDialog.getModel("action");
                oHRActionModel.setProperty("/HRBossId", oContextObj.HrBossId);
                oHRActionModel.setProperty("/HRBossName", oContextObj.HrBossName);
                oHRActionModel.setProperty("/EmplName", oContextObj.EmployeeName);
                oHRActionModel.setProperty("/Begda", this.formatter.dateToString(oContextObj.BeginDate));
                oHRActionModel.setProperty("/Endda", this.formatter.dateToString(oContextObj.EndDate));
                oHRActionModel.setProperty("/OrderDate", this.formatter.dateToString(oContextObj.BeginDate));
                oHRActionModel.setProperty("/StartDate", this.formatter.dateToString(oContextObj.BeginDate));
                oHRActionModel.setProperty("/OrderRemark", oContextObj.RequestId);
            }

            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oHRActionDialog);
            this.oHRActionDialog.open();
        },

        _filterInboxByYear: function (sChannel, sEvent, oData) {

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
                }
            });

            if (this.oManagerController.getSelectedEmployees()) {
                this.getView().byId("inboxTable").setSelectedContextPaths(this.oManagerController.getSelectedEmployees());
            }

            switch (this.oManagerController.getCurrentTab()) {
              case "plan":
                this._refreshTableBinding("inboxTable", true);
                break;
              case "tran":
                this._refreshTableBinding("transferTable", true);
                break;
              case "conf":
                this._refreshTableBinding("confirmTable", true);
                break;
            }
        },

        _deleteItem: function (oObject) {

            var that = this;
            var oDataModel = this.getModel("oData");

            var sCurrentContextPath = this.planCreationForm.getBindingContext("oData").getPath();
            var oCtxObject = oDataModel.getObject(sCurrentContextPath);

            var sObjectKey = "";
            sObjectKey = sObjectKey + "(OnlySubord='',";
            sObjectKey = sObjectKey + "PlanYear='" + oCtxObject.PlanYear + "',";
            sObjectKey = sObjectKey + "Pernr='" + oCtxObject.Pernr + "',";
            sObjectKey = sObjectKey + "ItemGuid=guid'" + oObject.ItemGuid + "')";

            oDataModel.remove(this.sVacationItemsPath + sObjectKey);
        },

        _showErrorInBox: function (oError) {

            var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
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

        },

        _refreshTableBinding: function (sTableId, bForce) {
            var oTable = this.getView().byId(sTableId);
            var oTableBinding = oTable.getBinding("items");

            oTableBinding.refresh(bForce);
        },

        onHRActionChange: function (oEvent) {

            if (this.oHRActionDialog) {

                var oModel = this.oHRActionDialog.getModel("action");

                if (oModel.getProperty("/CreO") !== true) {
                    oModel.setProperty("/OrderNum", "");

                    if (oModel.getProperty("/IncG") === true) {
                        oModel.setProperty("/OrderDate", "");
                        oModel.setProperty("/EditDate", false);
                    } else {
                        oModel.setProperty("/EditDate", true);
                        oModel.setProperty("/OrderDate", oModel.getProperty("/StartDate"));
                    }
                } else {
                    oModel.setProperty("/OrderDate", oModel.getProperty("/StartDate"));
                    oModel.setProperty("/EditDate", true);
                }
            }
        }

    });

});