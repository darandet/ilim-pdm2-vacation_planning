sap.ui.define([],
    function () {

        oFormatter = {};

        oFormatter.periodAction = function(sStatus)  {

            var oResourceBundle = this.getResourceBundle();

            if (sStatus === "CRTD") {
                return oResourceBundle.getText("masterRecord.actions.open");
            }

            if (sStatus === "OPEN" || sStatus === "CLSD") {
                return oResourceBundle.getText("masterRecord.actions.close");
            }


        };

        oFormatter.periodActionType = function (sStatus) {

            if (sStatus === "CRTD") {
                return sap.m.ButtonType.Accept;
            }

            if (sStatus === "OPEN" || sStatus === "CLSD") {
                return sap.m.ButtonType.Reject;
            }

        };


        oFormatter.periodActionIcon = function (sStatus) {

            if (sStatus === "CRTD") return "sap-icon://unlocked";
            if (sStatus === "OPEN" || sStatus === "CLSD") return "sap-icon://locked";
        };
        
        
        oFormatter.periodStatus = function (sStatus) {

            var oResourceBundle = this.getResourceBundle();


            if (sStatus === "CRTD") return oResourceBundle.getText("masterRecord.status.unopened");
            if (sStatus === "OPEN") return oResourceBundle.getText("masterRecord.status.opened");
            if (sStatus === "CLSD") return oResourceBundle.getText("masterRecord.status.closed");
        };

        oFormatter.periodState = function (sStatus) {

            if (sStatus === "CRTD") {
                return sap.ui.core.ValueState.Warning;
            } else if (sStatus === "OPEN") {
                return sap.ui.core.ValueState.Success;
            } else if (sStatus === "CLSD") {
                return sap.ui.core.ValueState.Error;
            }

        };

        oFormatter.periodActionEnabled = function (sStatus) {

            return sStatus !== "CLSD";

        };

        oFormatter.periodDeleteEnabled = function (sStatus) {

            return sStatus === "CRTD";

        };

        return oFormatter;

    });