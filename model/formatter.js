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
                return;
            }

            return oPlanningActions.checkActionEnabled(sStatus, "delete");

        };

        oFormatter.confirmEnabled = function (sStatus) {
            if (sStatus === undefined) {
                return;
            }

            return oPlanningActions.checkActionEnabled(sStatus, "confirm");

        };

        oFormatter.transferEnabled = function (sStatus) {
            if (sStatus === undefined) {
                return;
            }

            return oPlanningActions.checkActionEnabled(sStatus, "transfer");

        };

        return oFormatter;

    });