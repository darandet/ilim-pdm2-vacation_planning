sap.ui.define([
        "jquery.sap.global"
    ],
    function ($) {

        var planningActions = {};

        planningActions.statusActions = {
            draft: {
                functions: ["delete"]
            },

            approved: {
                functions: ["confirm", "transfer"]
            },

            pending: {
                functions: []
            }

        };


        planningActions.checkActionEnabled = function (sStatus, sAction) {

            if (!sStatus) {
               return false;
            }

            for (key in planningActions.statusActions) {
                if(planningActions.statusActions.hasOwnProperty(key) && key === sStatus.toLowerCase()) {
                    var oStatus = planningActions.statusActions[key];
                }
            }

            return oStatus.functions.indexOf(sAction.toLowerCase()) > -1;

        };

        return planningActions;

    });