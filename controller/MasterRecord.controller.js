sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/m/Dialog",
    "sap/m/Button"
], function (Controller, Dialog, Button) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.MasterRecord", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.MasterRecord
         */
        //	onInit: function() {
        //
        //	},

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf ilim.pdm2.vacation_planning.MasterRecord
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf ilim.pdm2.vacation_planning.MasterRecord
         */
        //	onAfterRendering: function() {
        //
        //	},

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf ilim.pdm2.vacation_planning.MasterRecord
         */
        //	onExit: function() {
        //
        //	}
        
        onPeriodCreate: function (oEvent) {
            var that = this;
            if (!that.createPeriodDialog) {

                var oFormFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.CreatePeriod");

                that.createPeriodDialog = new Dialog({
                    title: 'Создание периода планирования',
                    contentWidth: "35%",
                    draggable: true,
                    content: oFormFragment,
                    beginButton: new Button({
                        text: "Создать",
                        type: "Accept",
                        press: function () {
                            that.createPeriodDialog.close();
                        }
                    }),
                    endButton: new Button({
                        text: "Отмена",
                        press: function () {
                            that.createPeriodDialog.close();
                        }
                    })
                });

                //to get access to the global model
                that.getView().addDependent(that.createPeriodDialog);
            }

            that.createPeriodDialog.open();
        },

        onRecordInput: function (oEvent) {
            //TODO добавить проверку на ввод. maxLength не работает с типом ввода Number
        }
        
    });

});