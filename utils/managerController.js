sap.ui.define([
        "sap/ui/base/Object",
        "sap/ui/model/Filter"
    ],
    function (BaseObject, Filter) {

        oManagerController = {


            constructor: function () {
                this.selectedYear = "";
                this.aSelectionFilters = [];
                this.oModel = {};
                this.oWhenPeriodIsLoaded = {};
                this.aSelectedEmplCntx = [];
            },

            setCurrentYear: function (sYear) {
                this.selectedYear = sYear;
            },

            getCurrentYear: function () {
                return this.selectedYear;
            },

            getComplexFilter: function (sEmployee) {
                var aFilters = [];
                var EmployeeFilter;
                var YearFilter = new Filter("PlanYear", sap.ui.model.FilterOperator.EQ, this.getCurrentYear());

                if (isNaN(sEmployee)) {
                    EmployeeFilter = new Filter("EmployeeName", sap.ui.model.FilterOperator.Contains, sEmployee);
                } else {
                    EmployeeFilter = new Filter("EmployeeId", sap.ui.model.FilterOperator.EQ, sEmployee);
                }

                aFilters.push(YearFilter);
                aFilters.push(EmployeeFilter);
                return aFilters;

            },

            getManagerDefaultPeriod: function (sPath, fnResolve, fnReject) {
                var that = this;

                this.oWhenPeriodIsLoaded = new Promise( function (resolve, reject) {
                    var oModel = that.getModel();

                    oModel.read(sPath, {
                        success:resolve,
                        error: reject
                    });
                });

                this.oWhenPeriodIsLoaded.then(fnResolve, fnReject);

            },

            setModel: function (oModel) {
                this.oModel = oModel;
            },

            getModel: function () {
                return this.oModel;
            },

            setSelectedEmployees: function (aBindingContexts) {
                this.aSelectedEmplCntx = aBindingContexts;
            },

            getSelectedEmployees: function () {
                return this.aSelectedEmplCntx;
            }

        };


        return BaseObject.extend("ilim.pdm2.vacation_planning.utils.managerController", oManagerController);

    }
);