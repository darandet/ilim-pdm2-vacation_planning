sap.ui.define(["ilim/pdm2/vacation_planning/model/planningActions"],
    function (oPlanningActions) {

        var oFormatter = {};

        oFormatter.vacationStatus = function (sStatus) {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            switch (sStatus) {

                case "DRAFT":
                    return oResourceBundle.getText("vacation.status.draft");
                case "APPROVED":
                    return oResourceBundle.getText("vacation.status.approved");
                case "PENDING":
                    return oResourceBundle.getText("vacation.status.pending");
            }

        };

        oFormatter.vacationState = function (sStatus) {

            switch (sStatus) {
                case "DRAFT":
                    return sap.ui.core.ValueState.None;
                case "APPROVED":
                    return sap.ui.core.ValueState.Success;
                case "PENDING":
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