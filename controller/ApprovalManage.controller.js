sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
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

        onApprovePlan: function (oEvent) {

            var oSource         = oEvent.getSource();
            var sCtxPath        = oSource.getParent().getBindingContext("oData").getPath(); //Button -> Item
            var oCurrentCtxObj  = this.getModel("oData").getObject(sCtxPath);

            var that = this;

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
                            oCurrentCtxObj.comment = oCommentModel.getProperty("/Comment");

                            that._callActionOnPlan(oCurrentCtxObj, "APROV");

                            oCommentModel.setProperty("/Comment", "");
                            that.commentDialog.close();
                        }
                    })

                });
                this.commentDialog.setModel(oCommentModel, "comment");
                this.getView().addDependent(this.commentDialog);


            }

            this.commentDialog.open();
        },

        onRejectPlan: function (oEvent) {

            var oSource         = oEvent.getSource();
            var sCtxPath        = oSource.getParent().getBindingContext("oData").getPath(); //Button -> Item
            var oCurrentCtxObj  = this.getModel("oData").getObject(sCtxPath);

            var that = this;

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
                            oCurrentCtxObj.comment = oCommentModel.getProperty("/Comment");

                            that._callActionOnPlan(oCurrentCtxObj, "REJEC");

                            oCommentModel.setProperty("/Comment", "");
                            that.commentDialog.close();
                        }
                    })

                });
                this.commentDialog.setModel(oCommentModel, "comment");
                this.getView().addDependent(this.commentDialog);


            }

            this.commentDialog.open();
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

            var that = this;
            if (!that.planCreationForm) {

                var oPlanView = sap.ui.xmlview("ilim.pdm2.vacation_planning.view.PlanCreate");
                that.planCreationForm = new Dialog({
                    title: this.getResourceBundle().getText("vacation.footer.button.vacationPlan"),
                    resizable: true,
                    content: oPlanView,
                    beginButton: new Button({
                        text: this.getResourceBundle().getText("common.commentsDialog.CancelButton"),
                        press: function () {
                            that.planCreationForm.close();
                        }
                    })
                })
            }

            that.planCreationForm.open();

        },

        _callActionOnPlan: function (oContextObject, Action) {

            var oDataModel = this.getView().getModel("oData");

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

            var fnHandleSuccess = function (oData, response) {
                var oTable = this.getView().byId("inboxTable");
                var oTableBinding = oTable.getBinding("items");

                oTableBinding.refresh();
            }.bind(this);

        },

        _filterInboxByYear: function (sChannel, sEvent, oData) {

            //Очистить поле поиска сотрудника
            var oSearchField = this.getView().byId("inboxEmployeeSearchField");
            oSearchField.setValue("");

            var aFilters = [];
            var filter = new Filter("PlanYear", sap.ui.model.FilterOperator.EQ, oData.PlanYear);

            aFilters.push(filter);

            // update list binding
            var list = this.getView().byId("inboxTable");
            var binding = list.getBinding("items");
            if (binding) {
                binding.filter(filter);
            }

        },

        _patternMatched: function () {

            var that = this;

            this.getOwnerComponent().oRolesLoaded.then( function (oData) {
                if (!oData.CanApprove) {
                    that.getRouter().navTo("NoAuthorization");
                } else {
                    if (that.oManagerController.getCurrentYear()) {
                        that._filterInboxByYear(null, null, {PlanYear: that.oManagerController.getCurrentYear()});
                    } else {

                        that.oManagerController.oWhenPeriodIsLoaded.then( function (oData) {

                            that._filterInboxByYear(null, null, oData);

                        });
                    }
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