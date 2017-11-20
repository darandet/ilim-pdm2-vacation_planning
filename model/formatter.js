sap.ui.define(["ilim/pdm2/vacation_planning/model/planningActions"],
    function (oPlanningActions) {

        var oFormatter = {};

        oFormatter.vacationStatus = function (sStatus) {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            switch (sStatus) {

                case "VP01":
                    return oResourceBundle.getText("vacation.employee.status.draft");
                case "VP04":
                    return oResourceBundle.getText("vacation.employee.status.Rejected");
                case "VP09":
                    return oResourceBundle.getText("vacation.employee.status.Approved");
                default:
                    return oResourceBundle.getText("vacation.employee.status.onApproval");
            }

        };

        oFormatter.vacationState = function (sStatus) {

            switch (sStatus) {
                case "VP01":
                    return sap.ui.core.ValueState.None;
                case "VP04":
                    return sap.ui.core.ValueState.Error;
                case "VP09":
                    return sap.ui.core.ValueState.Success;
                default:
                    return sap.ui.core.ValueState.Warning;

            }

        };

        oFormatter.deleteEnabled = function (sStatus) {

            if (sStatus === undefined) {
                return false;
            }

            return oPlanningActions.checkActionEnabled(sStatus, "delete");

        };

        oFormatter.confirmEnabled = function (sStatus) {
            if (sStatus === undefined) {
                return false;
            }

            return oPlanningActions.checkActionEnabled(sStatus, "confirm");

        };

        oFormatter.transferEnabled = function (sStatus) {
            if (sStatus === undefined) {
                return false;
            }

            return oPlanningActions.checkActionEnabled(sStatus, "transfer");

        };

        oFormatter.vacationPlanStatus = function (sStatus, bCanApprove) {

            if (bCanApprove) {
                return this.getResourceBundle().getText("main.planStatus.Pending");
            } else {
                return this.getResourceBundle().getText("main.planStatus." + sStatus);
            }

        };

        oFormatter.vacationPlanState = function (sStatus) {

            if (sStatus === "VP09") {
                return sap.ui.core.ValueState.Success;
            } else if (sStatus === "VP00" || sStatus === "VP01" ) {
                return sap.ui.core.ValueState.None;
            } else if (sStatus === "VP04") {
                return sap.ui.core.ValueState.Error;
            } else {
                return sap.ui.core.ValueState.Warning;
            }

        };

        oFormatter.vacationPlanRejectIcon = function (sStatus) {

            if (sStatus.substr(2, 2) > "04") {
                return "sap-icon://reset";
            } else {
                return "sap-icon://decline";
            }
        };

        oFormatter.planCommentTimestamp = function (Date, Time) {
            return Date.toString() + Time.toString();
        };

        return oFormatter;

    });