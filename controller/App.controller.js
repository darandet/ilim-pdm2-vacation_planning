sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController"
], function (Controller) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.App", {

        onInit: function() {

            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

        },

        onBeforeRendering: function() {

        },

        onAfterRendering: function() {

        },

        onExit: function() {

        }


    });

});