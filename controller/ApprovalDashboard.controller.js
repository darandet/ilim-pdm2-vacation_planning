sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/viz/ui5/format/ChartFormatter"
], function (Controller, JSONModel, Filter, ChartFormatter) {
    "use strict";

    return Controller.extend("ilim.pdm2.vacation_planning.controller.ApprovalDashboard", {


        onInit: function() {

            this.getRouter().getRoute("ApprovalsDashboard").attachPatternMatched(this._patternMatched, this);

            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.subscribe("managerHeaderChanges", "yearSelection", this._filterDashboardByYear, this);

            this.oManagerController = this.getOwnerComponent().oManagerController;

            //Set VizChart Settings
            var oDaysPlannedChart = this.getView().byId("DaysPlannedChart");
            oDaysPlannedChart.setVizProperties({
                valueAxis: {
                    title: {
                        visible: false
                    },
                    label: {
                        visible: false
                    }
                },
                categoryAxis: {
                    title: {
                        visible: false
                    },
                    label: {
                        visible: true
                    }
                },
                title: {
                    visible: false
                },
                legendGroup: {
                    layout: {
                        position: 'bottom'
                    }
                },
                legend: {
                    visible: false
                },
                toolTip : {
                    visible: false
                },
                interaction: {
                    behaviorType: 'noHoverBehavior'
                },
                plotArea: {
                    dataPointStyle: {
                        rules: [
                            {
                                dataContext: {
                                    Category: this.getResourceBundle().getText("dashboard.graphic.chartSettings.DaysAvailable")
                                },
                                properties: {
                                    color: "sapUiChartPaletteQualitativeHue1"
                                }
                            },
                            {
                                dataContext: {
                                    Category: this.getResourceBundle().getText("dashboard.graphic.chartSettings.DaysPlanned")
                                },
                                properties: {
                                    color: "sapUiChartPaletteQualitativeHue2"
                                }
                            },
                            {
                                dataContext: {
                                    Category: this.getResourceBundle().getText("dashboard.graphic.chartSettings.DaysApproved")
                                },
                                properties: {
                                    color: 'sapUiChartPaletteQualitativeHue3'
                                }
                            }
                        ]
                    },
                    dataLabel: {
                        visible: true,
                        position: "outsideFirst"
                    }

                }
            });


            var oAbsencePercentChart = this.getView().byId("AbsencePercentChart");
            oAbsencePercentChart.setVizProperties({
                valueAxis: {
                    title: {
                        visible: false
                    },
                    label: {
                        visible: false
                    }
                },
                categoryAxis: {
                    title: {
                        visible: false
                    }
                },
                title: {
                    visible: false
                },
                legendGroup: {
                    layout: {
                        position: 'bottom'
                    }
                },
                legend: {
                    visible: false
                },
                toolTip : {
                    visible: false
                },
                interaction: {
                    behaviorType: 'noHoverBehavior'
                },
                plotArea: {
                    dataLabel: {
                        visible: true,
                        position: "outside",
                        formatString: ChartFormatter.DefaultPattern.SHORTFLOAT
                    }
                }
            });

            var oApprovedCountChart = this.getView().byId("ApprovedCountChart");
            oApprovedCountChart.setVizProperties({
                valueAxis: {
                    title: {
                        visible: false
                    },
                    label: {
                        visible: false
                    }
                },
                categoryAxis: {
                    title: {
                        visible: false
                    }
                },
                title: {
                    visible: false
                },
                legendGroup: {
                    layout: {
                        position: 'bottom'
                    }
                },
                legend: {
                    visible: true
                },
                toolTip : {
                    visible: false
                },
                interaction: {
                    behaviorType: 'noHoverBehavior'
                }
            })

        },

        onDownloadT7pdf: function () {

            var sYear = this.oManagerController.getCurrentYear();
            var sSubord = this.oManagerController.getOnlySubord();
            var sServicePath = this.getOwnerComponent().getManifestEntry("sap.app").dataSources.MainService.uri;
            var sODataKey = "(PlanYear='" + sYear +"',EmployeeId='',OnlySubord='" + sSubord + "',FileType='PDF')";

            window.open(sServicePath + "/NoAccessEmployeesSet" + sODataKey +  "/$value");
        },

        onDownloadT7xls: function () {

            var sYear = this.oManagerController.getCurrentYear();
            var sSubord = this.oManagerController.getOnlySubord();
            var sServicePath = this.getOwnerComponent().getManifestEntry("sap.app").dataSources.MainService.uri;
            var sODataKey = "(PlanYear='" + sYear +"',EmployeeId='',OnlySubord='" + sSubord + "',FileType='XLS')";

            window.open(sServicePath + "/NoAccessEmployeesSet" + sODataKey +  "/$value");
        },


        _patternMatched: function () {
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.publish("childNavigation", "syncViews", { key: "overviewTab" });

            var that = this;

            this.getOwnerComponent().oRolesLoaded.then( function (oData) {
                if (!oData.CanApprove) {
                    that.getRouter().navTo("NoAuthorization");
                } else {
                    that.oManagerController.oWhenPeriodIsLoaded.then( function (oData) {
                        var oCurrentBinding = that.getView().getBindingContext("oData");
                        if (oCurrentBinding) {
                            that.getModel("oData").read(oCurrentBinding.getPath() + "/ToRelevantMasterRecord", {
                                success: function (oData) {
                                    that._setAbsenceReferenceLine(oData.MaxPercent);
                                }
                            });
                        } else {
                        }
                    });
                }
            });
        },

        _filterDashboardByYear: function (sChannel, sEvent, oData) {

            var that = this;
            var oCurrentBinding = this.getView().getBindingContext("oData");
            var sBindingPath;
            var oModel = this.getModel("oData");

            if (!oModel) {
              oModel = this.getOwnerComponent().getModel("oData");
            }
            if (oCurrentBinding) {
                sBindingPath = oCurrentBinding.getPath();
                oModel.read(sBindingPath + "/ToRelevantMasterRecord", {
                    success: function (oData) {
                        that._setAbsenceReferenceLine(oData.MaxPercent);
                    }
                });
            } else {
                var sSubord = this.oManagerController.getOnlySubord();
                sBindingPath = "/ManagingPeriodsSet(PlanYear='" + oData.PlanYear + "',OnlySubord='" + sSubord + "')/ToRelevantMasterRecord";
                oModel.read(sBindingPath, {
                    success: function (oData) {
                        this._setAbsenceReferenceLine(oData.MaxPercent);
                    }.bind(this)
                })
            }
        },

        _setAbsenceReferenceLine: function (AbsencePercent) {

            var oAbsencePercentChart = this.getView().byId("AbsencePercentChart");

            var oVizProperties = oAbsencePercentChart.getVizProperties();
            oVizProperties.plotArea.referenceLine = {
                line: {
                    valueAxis: [{
                        value: AbsencePercent,
                        visible: true,
                        size: 1,
                        type: "dotted",
                        label: {
                            text: AbsencePercent,
                            visible: true
                        }
                    }]
                }
            };

            oAbsencePercentChart.setVizProperties(oVizProperties);
        }
    });
});