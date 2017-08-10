sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.shell.Shell", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.shell.Shell
         */
        onInit: function() {

            this.getRouter().getRoute("HomePage").attachPatternMatched(this._patternMatched, this);

            var oModel = new JSONModel();
            oModel.loadData("http://localhost:3000/users/current", undefined, false);
            this.setModel(oModel, "user");
            
            
            
            this.oRolesLoaded = new Promise( function (fnResolve, fnReject) {
                var oRolesModel = new JSONModel();

                oRolesModel.attachRequestCompleted(function (oEvent) {
                    fnResolve(oRolesModel);
                }, this);
                oRolesModel.loadData("http://localhost:3000/roles/" + oModel.getProperty("/user"));

            });

        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf ilim.pdm2.vacation_planning.shell.Shell
         */
        onBeforeRendering: function() {

            var that = this;

            this.oRolesLoaded.then(function (oModel) {

                var oSideNavigation = that.getView().byId('sideNavigation');
                var oItemAggregation = oSideNavigation.getItem();
                var aItems = oItemAggregation.getItems();

                for (var i = 0; i < 3; i++) {
                    var sId = aItems[i].getId();
                    if (sId.indexOf("planNavItem") > 0 && !oModel.getProperty("/can_plan")) {
                        oItemAggregation.removeItem(sId);
                    }
                    if (sId.indexOf("approveNavItem") > 0 && !oModel.getProperty("/can_approve")) {
                        oItemAggregation.removeItem(sId);
                    }
                    if (sId.indexOf("controlNavItem") > 0 && !oModel.getProperty("/can_control")) {
                        oItemAggregation.removeItem(sId);
                    }
                }

                oSideNavigation.setVisible(true);

            })

        },

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf ilim.pdm2.vacation_planning.shell.Shell
         */
        //	onAfterRendering: function() {
        //
        //	},

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf ilim.pdm2.vacation_planning.shell.Shell
         */
        //	onExit: function() {
        //
        //	}

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

        _patternMatched: function () {

            var oModel = this.getModel("user");
            if (oModel) {
                var user = oModel.getProperty("/user");
            }

            var oRouter = this.getRouter();
            oRouter.navTo("PlanOverview");
            //TODO дыра в безопасности, если вводить путь напрямую

        }

    });

});