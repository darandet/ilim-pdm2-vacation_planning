sap.ui.define([],
    function () {

        oManagerController = {

            selectedYear: "",
            aSelectionFilters: [],
            oModel: {},
            oWhenPeriodIsLoaded: {},

            setCurrentYear: function (sYear) {
                this.selectedYear = sYear;
            },

            getCurrentYear: function () {
                return this.selectedYear;
            },

            getManagerDefaultPeriod: function (sPath) {

                this.oWhenPeriodIsLoaded = new Promise( function (fnResolve, fnReject) {
                    var oModel = this.getModel();

                    oModel.read(sPath, {
                        success:fnResolve,
                        error: fnReject
                    });
                });

            },

            setModel: function (oModel) {
                this.oModel = oModel;
            }

        };


        return BaseObject.extend("ilim.pdm2.vacation_planning.utils.managerController");

    }
);