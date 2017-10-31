sap.ui.define([
        "jquery.sap.global"
    ],
    function ($) {

        var planningActions = {};

        planningActions.statusActions = {
            VP01: {
                functions: ["delete"]
            },

            VP04: {
                functions: ["delete"]
            },

            VP09: {
                functions: ["confirm", "transfer"]
            }

        };


        planningActions.checkActionEnabled = function (sStatus, sAction) {

            if (!sStatus) {
               return false;
            }

            for (key in planningActions.statusActions) {
                if(planningActions.statusActions.hasOwnProperty(key) && key === sStatus.toUpperCase()) {
                    var oStatus = planningActions.statusActions[key];
                }
            }

            return oStatus.functions.indexOf(sAction.toLowerCase()) > -1;

        };

        return planningActions;

    });