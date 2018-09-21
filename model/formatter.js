sap.ui.define(["ilim/pdm2/vacation_planning/model/planningActions"],
    function (oPlanningActions) {

        var oFormatter = {};

        oFormatter.vacationStatus_old = function (sStatus) {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            switch (sStatus) {

                case "VP01":
                    return oResourceBundle.getText("vacation.employee.status.draft");
                case "VP04":
                    return oResourceBundle.getText("vacation.employee.status.Rejected");
                case "VP09":
                    return oResourceBundle.getText("vacation.employee.status.Approved");
                case undefined:
                    return "";
                default:
                    return oResourceBundle.getText("vacation.employee.status.onApproval");
            }

        };

        oFormatter.vacationStatus = function (sStatus) {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            switch (sStatus) {

                case "VP01":
                    return oResourceBundle.getText("vacation.employee.status.draft");
                case "VP02":
                    return oResourceBundle.getText("vacation.employee.status.draft");
                case "VP03":
                    return oResourceBundle.getText("vacation.employee.status.VP03");
                case "VP04":
                    return oResourceBundle.getText("vacation.employee.status.Rejected");
                case "VP05":
                    return oResourceBundle.getText("vacation.employee.status.VP05");
                case "VP06":
                    return oResourceBundle.getText("vacation.employee.status.VP06");
                case "VP07":
                    return oResourceBundle.getText("vacation.employee.status.VP07");
                case "VP08":
                    return oResourceBundle.getText("vacation.employee.status.VP08");
                case "VP09":
                    return oResourceBundle.getText("vacation.employee.status.Approved");
                case undefined:
                    return "";
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

        oFormatter.vacationProc = function (sProc) {

            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            switch (sProc) {
                case "PLAN":
                    return oResourceBundle.getText("vacation.employee.proc.plan");
                case "CONF":
                    return oResourceBundle.getText("vacation.employee.proc.conf");
                case "TRAN":
                    return oResourceBundle.getText("vacation.employee.proc.tran");
                default:
                    return "";
            }
        };

        oFormatter.vacEditEnabled = function (sProc) {

            switch (sProc) {
                case "PLAN":
                    return true;
                case "CONF":
                    return false;
                case "TRAN":
                    return true;
                default:
                    return false;
            }
        };

        oFormatter.dateToString = function (dDate) {

          var ret        = new sap.ui.model.type.String();
          var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd.MM.yyyy" });
          var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;
          ret = "";

          if (dDate)
          {
            ret = dateFormat.format(new Date(dDate.getTime() + TZOffsetMs));
          }

          return ret;
        };

        oFormatter.roundDays = function (rDays) {

            var ret = 0;

            if (rDays) {
                ret = Math.floor(rDays);
            }

            return ret;
        };

        oFormatter.dateToAbapDate = function (dDate) {

            var ret      = dDate;
            var TZOffset = new Date(0).getTimezoneOffset()*60*1000;
            ret.setTime(ret.getTime() -TZOffset);

            return ret;
        };


        oFormatter.any2Boolean = function (sValue) {

            if (sValue) {
              return true;
            } else {
              return false;
            }
        };

        oFormatter.deleteEnabled = function (sStatus) {

            if (sStatus === undefined) {
                return false;
            }

            return oPlanningActions.checkActionEnabled(sStatus, "delete");

        };

        oFormatter.confirmEnabled = function (sStatus, Allowed, sVpProc) {
            if (sStatus === undefined || !Allowed || sVpProc === 'CONF') {
                return false;
            }

            return oPlanningActions.checkActionEnabled(sStatus, "confirm");

        };

        oFormatter.transferEnabled = function (sStatus, Allowed, sVpProc) {

            if (sStatus === undefined || !Allowed || sVpProc !== 'PLAN' ) {
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

            if (!sStatus) {
                return "sap-icon://reset";
            }

            if (sStatus.substr(2, 2) > "04") {
                return "sap-icon://reset";
            } else {
                return "sap-icon://decline";
            }
        };

        return oFormatter;

    });