sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/tnt/NavigationListItem"
], function (Controller, JSONModel, MessageBox, NavItem) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.shell.Shell", {


        onInit: function() {

            var that = this;

            this.getRouter().getRoute("HomePage").attachPatternMatched(this._patternMatched, this);

            var fnDataReceived = function (oData, response) {

                var oSideNavigation = that.getView().byId('sideNavigation');

                if (oData.CanPlan) {
                    var oItemPlan = new NavItem({
                      key:  "NavToPlan",
                      text: that.getResourceBundle().getText("sideNavigation.item.planVacation"),
                      icon: "sap-icon://appointment"
                    });
                    oSideNavigation.getItem().addItem(oItemPlan);
                }

                if (oData.CanApprove) {
                    var oItemAppr = new NavItem({
                      key:  "NavToApprov",
                      text: that.getResourceBundle().getText("sideNavigation.item.approvePlan"),
                      icon: "sap-icon://sap-box"
                    });
                    oSideNavigation.getItem().addItem(oItemAppr);
                }

                if (oData.CanControl) {
                    var oItemMaster = new NavItem({
                      key:  "NavToControl",
                      text: that.getResourceBundle().getText("sideNavigation.item.masterRecords"),
                      icon: "sap-icon://approvals"
                    });
                    oSideNavigation.getItem().addItem(oItemMaster);
                }

                oSideNavigation.setVisible(true);
            };

            var fnConnectionError = function (oError) {

                MessageBox.error(oError.message, {
                    title: oError.statusText,
                    details: oError.responseText
                });
            };

            this.getOwnerComponent().oRolesLoaded = new Promise( function (fnResolve, fnReject) {

                    var oDataModel = that.getOwnerComponent().getModel("oData");

                    oDataModel.read("/BusinessRolesSet('')", {
                        success: fnResolve,
                        error: fnReject
                    });

            });

            this.getOwnerComponent().oRolesLoaded.then(fnDataReceived, fnConnectionError);

        },

        onBeforeRendering: function() {


        },


        onSideNavigation: function (oEvent) {

            var oRouter = this.getRouter();
            var sKey = oEvent.getParameter("item").getKey();

            if (sKey === "NavToPlan") {
                oRouter.navTo("PlanOverview");
            } else if (sKey === "NavToControl") {
                oRouter.navTo("MasterRecord");
            } else if (sKey === "NavToApprov") {
                oRouter.navTo("ApprovePlan");
            } else if (sKey === "switchState") {
                var oToolPage = this.getView().byId("idAppContent");
                oToolPage.toggleSideContentMode(!oToolPage.getSideExpanded());
                oEvent.preventDefault();
            }

        },

        onSideNavButtonPress: function () {

            this.getView().byId("idAppContent").setSideExpanded(!this.getView().byId("idAppContent").getSideExpanded());
        },

        _patternMatched: function () {

            var oRouter = this.getRouter();
            this.getOwnerComponent().oRolesLoaded.then(function (oData) {
                if (!sap.ui.Device.system.phone) {
                    if (oData.CanPlan) {
                        oRouter.navTo("PlanOverview");
                    }
                    else {
                        if (oData.CanApprove) {
                            oRouter.navTo("ApprovePlan");
                        } else {
                            if (oData.CanControl) {
                                oRouter.navTo("MasterRecord");
                            } else {
                                oRouter.navTo("NoAuthorization");
                            }
                        }
                    }
                }
            });
        }

    });

});