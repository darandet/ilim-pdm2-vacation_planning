sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.ApprovalOverview", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalOverview
         */
        onInit: function() {

            this.getRouter().getRoute("ApprovePlan").attachPatternMatched(this._patternMatched, this);
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.subscribe("childNavigation", "syncViews", this._syncViews, this)


            var oModel = new JSONModel({ key: "approvalTab" });
            this.setModel(oModel, "viewSync");
            
        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf ilim.pdm2.vacation_planning.ApprovalOverview
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalOverview
         */
        //	onAfterRendering: function() {
        //
        //	},

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalOverview
         */
        //	onExit: function() {
        //
        //	}

        onViewChange: function(oEvent) {

            var sKey = oEvent.getParameter('key');
            var oRouter = this.getRouter();

            if (sKey === 'approvalTab') {
                oRouter.navTo('ManageApprovals');
            } else if (sKey === 'overviewTab') {
                oRouter.navTo('ApprovalsDashboard');
            }

        },
        
        _patternMatched: function () {

            var oRouter = this.getRouter();

            oRouter.navTo('ManageApprovals');
        },
        
        _syncViews: function (sChannel, sEvent, oData) {


            if (sChannel === "childNavigation" && sEvent === "syncViews" ) {

                var oModel = this.getModel("viewSync");
                oModel.setProperty('/key', oData.key)
            }

        }
        
    });

});