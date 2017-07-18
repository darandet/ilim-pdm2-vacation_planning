sap.ui.define([
        "sap/ui/core/UIComponent"
    ],
    function (UIComponent) {

        return UIComponent.extend("ilim.pdm2.vacation_planning.Component", {

            metadata: {
                manifest: "json"
            },

            init: function () {

                UIComponent.prototype.init.apply(this, arguments);

                this.getRouter().initialize();

            }
        });
    }
);