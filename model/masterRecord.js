sap.ui.define([],
    function () {

        oFormatter = {};

        oFormatter.periodAction = function(sStatus)  {

            var oResourceBundle = this.getResourceBundle();

            if (sStatus === "UNOPENED") {
                return oResourceBundle.getText("masterRecord.actions.open");
            }

            if (sStatus === "OPENED" || sStatus === "CLOSED") {
                return oResourceBundle.getText("masterRecord.actions.close");
            }


        };

        oFormatter.periodActionType = function (sStatus) {

            if (sStatus === "UNOPENED") {
                return sap.m.ButtonType.Accept;
            }

            if (sStatus === "OPENED" || sStatus === "CLOSED") {
                return sap.m.ButtonType.Reject;
            }

        };


        oFormatter.periodActionIcon = function (sStatus) {

            if (sStatus === "UNOPENED") return "sap-icon://unlocked";
            if (sStatus === "OPENED" || sStatus === "CLOSED") return "sap-icon://locked";
        };
        
        
        oFormatter.periodStatus = function (sStatus) {

            var oResourceBundle = this.getResourceBundle();


            if (sStatus === "UNOPENED") return oResourceBundle.getText("masterRecord.status.unopened");
            if (sStatus === "OPENED") return oResourceBundle.getText("masterRecord.status.opened");
            if (sStatus === "CLOSED") return oResourceBundle.getText("masterRecord.status.closed");
        };

        oFormatter.periodState = function (sStatus) {

            if (sStatus === "UNOPENED") {
                return sap.ui.core.ValueState.Warning;
            } else if (sStatus === "OPENED") {
                return sap.ui.core.ValueState.Success;
            } else if (sStatus === "CLOSED") {
                return sap.ui.core.ValueState.Error;
            }

        };

        oFormatter.periodActionEnabled = function (sStatus) {

            return sStatus !== "CLOSED"

        };

        return oFormatter;

    });