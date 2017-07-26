sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    'sap/ui/model/json/JSONModel'
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.ApprovalDashboard", {


        sDataPath1: "https://sapui5.hana.ondemand.com/test-resources/sap/viz/demokit/dataset/milk_production_testing_data/revenue_cost_consume/betterMedium.json",
        sDataPath2: "https://sapui5.hana.ondemand.com/test-resources/sap/viz/demokit/dataset/milk_production_testing_data/revenue_cost_consume/small.json",

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalDashboard
         */
        onInit: function() {

            var oModel;
            var oVizFrame;
            var sLocalPath;

            for (var i = 0; i < 3; i++) {

                if (i === 0) {
                    oVizFrame = this.getView().byId("idVizFrame");
                    sLocalPath = this.sDataPath1;
                } else if (i === 1) {
                    oVizFrame = this.getView().byId("idVizFrame2");
                    sLocalPath = this.sDataPath2;
                } else if (i === 2) {
                    oVizFrame = this.getView().byId("idVizFrame3");
                    sLocalPath = this.sDataPath2;
                }

                oModel = new JSONModel(sLocalPath);
                oVizFrame.setModel(oModel);

                oVizFrame.setVizProperties({
                    valueAxis: {
                        title: {
                            visible: false
                        },
                        label: {
                            visible: false
                        }
                    },
                    categoryAxis: {
                        title: {
                            visible: false
                        }
                    },
                    title: {
                        visible: false
                    },
                    legendGroup: {
                        layout: {
                            position: 'auto'
                        }
                    },
                    legend: {
                        visible: false
                    }
                });

                if (i === 2) {
                    oVizFrame.setVizProperties({
                        plotArea: {
                            referenceLine: {
                                line: {
                                    valueAxis: [{
                                        value: 1000000,
                                        visible: true,
                                        size: 1,
                                        type: "dotted",
                                        label: {
                                            text: "Target",
                                            visible: true
                                        }
                                    }]
                                }
                            }
                        }
                    });
                }

            }

            this.getRouter().getRoute("ApprovalsDashboard").attachPatternMatched(this._patternMatched, this);

        },

        _patternMatched: function () {
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.publish("childNavigation", "syncViews", { key: "overviewTab" });
        }

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf ilim.pdm2.vacation_planning.ApprovalDashboard
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalDashboard
         */
        //	onAfterRendering: function() {
        //
        //	},

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf ilim.pdm2.vacation_planning.ApprovalDashboard
         */
        //	onExit: function() {
        //
        //	}
    });

});