sap.ui.define(
    ["sap/ui/core/mvc/Controller"],
    function (Controller) {
        return Controller.extend("ilim.pdm2.vacation_planning.controller.BaseController", {

            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },

            getModel: function (sName) {
                return this.getView().getModel(sName);
            },

            setModel: function (oModel, sName) {
                return this.getView().setModel(oModel, sName);
            },

            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            }
        });
    }
);
