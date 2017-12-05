sap.ui.define([
        "sap/ui/base/Object",
        "sap/ui/model/Filter"
    ],
    function (BaseObject, Filter) {

        oManagerController = {


            constructor: function () {
                this.selectedYear = "";
                this.onlySubord   = "";
                this.aSelectionFilters = [];
                this.oModel = {};
                this.oWhenPeriodIsLoaded = {};
                this.aSelectedEmplCntx = [];
                this.aDepartments = [];
                this.aStatuses = [];
                this.aManagers = [];
                this.sSearchline = "";                    
            },

            setCurrentYear: function (sYear) {
                this.selectedYear = sYear;
            },
                
            setSearchline: function (sVal) {
                this.sSearchline = sVal;
            },

            addStatusVal: function (sVal) {
                this.aStatuses.push(sVal);
            },

            addDepartVal: function (sVal) {
                this.aDepartments.push(sVal);
            },

            addManagerVal: function (sVal) {
                this.aManagers.push(sVal);
            },

            clearFilters: function () {
                this.aDepartments = [];
                this.aStatuses = [];
                this.aManagers = [];
            },

            addStatusVal: function (sVal) {
                this.aStatuses.push(sVal);
            },                
                
            setOnlySubord: function (sSubord) {
                this.onlySubord = sSubord;
            },

            getOnlySubord: function () {
                return this.onlySubord;
            },                

            getCurrentYear: function () {
                return this.selectedYear;
            },

            getComplexFilter: function () {

                var aFilters = [];
                var EmployeeFilter;
                var filter = new Filter("PlanYear", sap.ui.model.FilterOperator.EQ, this.getCurrentYear());
                aFilters.push(filter);
                filter = new Filter("OnlySubord", sap.ui.model.FilterOperator.EQ, this.getOnlySubord());
                aFilters.push(filter);

                if (this.sSearchline.length > 0) {
                    if (/^\d+$/.test(this.sSearchline)) {
                        filter = new Filter("EmployeeId", sap.ui.model.FilterOperator.Contains, this.sSearchline);
                    } else {
                        filter = new Filter("EmployeeName", sap.ui.model.FilterOperator.Contains, this.sSearchline);
                    }
                    aFilters.push(filter);
                }

                if (this.aStatuses.length > 0) {
                    for (var i = 0; i < this.aStatuses.length; i++) {
                        filter = new Filter("PlanStatus", sap.ui.model.FilterOperator.EQ, this.aStatuses[i]);
                        aFilters.push(filter);
                    }
                }

                if (this.aDepartments.length > 0) {
                    for (var i = 0; i < this.aDepartments.length; i++) {
                        filter = new Filter("OrgunitId", sap.ui.model.FilterOperator.EQ, this.aDepartments[i]);
                        aFilters.push(filter);
                    }
                }

                if (this.aManagers.length > 0) {
                    for (var i = 0; i < this.aManagers.length; i++) {
                        filter = new Filter("Chper", sap.ui.model.FilterOperator.EQ, this.aManagers[i]);
                        aFilters.push(filter);
                    }
                }

                return aFilters;

            },                
                
            //getComplexFilter: function (sEmployee) {
            //    var aFilters = [];
            //    var EmployeeFilter;
            //    var YearFilter = new Filter("PlanYear", sap.ui.model.FilterOperator.EQ, this.getCurrentYear());

            //    if (isNaN(sEmployee)) {
            //        EmployeeFilter = new Filter("EmployeeName", sap.ui.model.FilterOperator.Contains, sEmployee);
            //    } else {
            //        EmployeeFilter = new Filter("EmployeeId", sap.ui.model.FilterOperator.EQ, sEmployee);
            //    }

            //    aFilters.push(YearFilter);
            //    aFilters.push(EmployeeFilter);
            //    return aFilters;

            //},

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
