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
                this.aPDepartments = [];
                this.aPStatuses = [];
                this.aPManagers = [];
                this.aTDepartments = [];
                this.aTStatuses = [];
                this.aTManagers = [];
                this.aCDepartments = [];
                this.aCStatuses = [];
                this.aCManagers = [];
                this.sTab = "plan";
                this.sPSearchline = "";
                this.sTSearchline = "";
                this.sCSearchline = "";                  
            },

            setCurrentYear: function (sYear) {
                this.selectedYear = sYear;
            },
                
            setSearchline: function (sVal) {
                switch (this.sTab) {
                  case "plan":
                    this.sPSearchline = sVal.toUpperCase();
                    break;
                  case "tran":
                    this.sTSearchline = sVal.toUpperCase();
                    break;
                  case "conf":
                    this.sCSearchline = sVal.toUpperCase();
                    break;
                }
            },

            addStatusVal: function (sVal) {
                switch (this.sTab) {
                  case "plan":
                    this.aPStatuses.push(sVal);
                    break;
                  case "tran":
                    this.aTStatuses.push(sVal);
                    break;
                  case "conf":
                    this.aCStatuses.push(sVal);
                    break;
                }
            },

            addDepartVal: function (sVal) {
                switch (this.sTab) {
                  case "plan":
                    this.aPDepartments.push(sVal);
                    break;
                  case "tran":
                    this.aTDepartments.push(sVal);
                    break;
                  case "conf":
                    this.aCDepartments.push(sVal);
                    break;
                }
            },

            addManagerVal: function (sVal) {
                switch (this.sTab) {
                  case "plan":
                    this.aPManagers.push(sVal);
                    break;
                  case "tran":
                    this.aTManagers.push(sVal);
                    break;
                  case "conf":
                    this.aCManagers.push(sVal);
                    break;
                }
            },

            clearFilters: function () {
                switch (this.sTab) {
                  case "plan":
                    this.aPDepartments = [];
                    this.aPStatuses = [];
                    this.aPManagers = [];
                    break;
                  case "tran":
                    this.aTDepartments = [];
                    this.aTStatuses = [];
                    this.aTManagers = [];
                    break;
                  case "conf":
                    this.aCDepartments = [];
                    this.aCStatuses = [];
                    this.aCManagers = [];
                    break;
                }
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

            setCurrentTab: function (sTab) {
                this.sTab = sTab;
            },                
                
            getCurrentTab: function () {
                return this.sTab;
            },                

            getComplexFilter: function () {

                var aFilters = [];
                var aStatuses = [];
                var aDepartments = [];
                var aManagers = [];
                var sSearch = "";
                var EmployeeFilter;

                switch (this.sTab) {
                  case "plan":
                    aStatuses    = this.aPStatuses;
                    aDepartments = this.aPDepartments;
                    aManagers    = this.aPManagers;
                    sSearch      = this.sPSearchline;
                    break;
                  case "tran":
                    aStatuses    = this.aTStatuses;
                    aDepartments = this.aTDepartments;
                    aManagers    = this.aTManagers;
                    sSearch      = this.sTSearchline;
                    break;
                  case "conf":
                    aStatuses    = this.aCStatuses;
                    aDepartments = this.aCDepartments;
                    aManagers    = this.aCManagers;
                    sSearch      = this.sCSearchline;
                    break;
                }

                var filter = new Filter("PlanYear", sap.ui.model.FilterOperator.EQ, this.getCurrentYear());
                aFilters.push(filter);
                filter = new Filter("OnlySubord", sap.ui.model.FilterOperator.EQ, this.getOnlySubord());
                aFilters.push(filter);

                if (sSearch.length > 0) {
                    if (/^\d+$/.test(sSearch)) {
                        filter = new Filter("EmployeeId", sap.ui.model.FilterOperator.Contains, sSearch);
                    } else {
                        filter = new Filter("EmployeeNameUp", sap.ui.model.FilterOperator.Contains, sSearch);
                    }
                    aFilters.push(filter);
                }

                if (aStatuses.length > 0) {
                    for (var i = 0; i < aStatuses.length; i++) {
                        filter = new Filter("PlanStatus", sap.ui.model.FilterOperator.EQ, aStatuses[i]);
                        aFilters.push(filter);
                    }
                }

                if (aDepartments.length > 0) {
                    for (var i = 0; i < aDepartments.length; i++) {
                        filter = new Filter("OrgunitId", sap.ui.model.FilterOperator.EQ, aDepartments[i]);
                        aFilters.push(filter);
                    }
                }

                if (aManagers.length > 0) {
                    for (var i = 0; i < aManagers.length; i++) {
                        filter = new Filter("Chper", sap.ui.model.FilterOperator.EQ, aManagers[i]);
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
