sap.ui.define([
        "sap/ui/base/Object"
    ],
    function (BaseObject) {

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
                var that = this;

                this.oWhenPeriodIsLoaded = new Promise( function (fnResolve, fnReject) {
                    var oModel = that.getModel();

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


        return BaseObject.extend("ilim.pdm2.vacation_planning.utils.managerController", oManagerController);

    }
);