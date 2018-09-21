sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "jquery.sap.global",
    "ilim/pdm2/vacation_planning/model/masterRecord",
    "sap/m/Dialog",
    "sap/m/Button"
], function (Controller, JSONModel, $, Formatter, Dialog, Button ) {


    return Controller.extend("ilim.pdm2.vacation_planning.controller.MasterRecord", {

        formatter: Formatter,


        onInit: function() {


        },


        //  onBeforeRendering: function() {
        //
        //  },


        //  onAfterRendering: function() {
        //
        //  },


        //  onExit: function() {
        //
        //  }


        onPeriodCreate: function (oEvent) {

            var that = this;
            if (!that._mRecordCreateDialog) {

                var oFormFragment = sap.ui.xmlfragment("ilim.pdm2.vacation_planning.view.fragments.CreatePeriod");

                that._mRecordCreateDialog = new Dialog({
                    title: this.getResourceBundle().getText("masterRecord.createDialog.Title"),
                    contentWidth: "35%",
                    draggable: true,
                    content: oFormFragment,
                    beginButton: new Button({
                        text: this.getResourceBundle().getText("masterRecord.createDialog.CreateButton"),
                        type: "Accept",
                        press: function () {
                            that._postMasterRecord();
                            that._mRecordCreateDialog.close();
                        }
                    }),
                    endButton: new Button({
                        text: this.getResourceBundle().getText("masterRecord.createDialog.CancelButton"),
                        press: function () {
                            that._mRecordCreateDialog.close();
                        }
                    })
                });

                //to get access to the global model
                that.getView().addDependent(that._mRecordCreateDialog);

                var oDialogModel = new JSONModel();

                that._mRecordCreateDialog.setModel(oDialogModel, "masterRecord");

            }


            that._mRecordCreateDialog.getModel("masterRecord").setData({
                bukrs: "",
                year: "",
                deadline: "",
                absence: "",
                notify: false
            });
            that._mRecordCreateDialog.open();
        },


        onUpdateMasterRecord: function (oEvent) {

            var oButton = oEvent.getSource();
            var oDataModel = this.getModel("oData");
            var sPath = oButton.getParent().getParent().getBindingContextPath(); //Layout => Cell => Line

            var oMasterRecord = oDataModel.getObject(sPath);

            if (oMasterRecord.VpStatus === "CRTD" || oMasterRecord.VpStatus === "CLSD") {
                oMasterRecord.Action = "OPEN"
            } else if (oMasterRecord.VpStatus === "OPEN") {
                oMasterRecord.Action = "CLOSE"
            }

            oMasterRecord.DoCommit = true;
            this._updateMasterRecord(oMasterRecord, oDataModel, "update")

        },


        onRecordInput: function (oEvent) {
            //TODO добавить проверку на ввод. maxLength не работает с типом ввода Number
        },


        onDeleteMasterRecord: function (oEvent) {

            var oButton = oEvent.getSource();
            var oDataModel = this.getModel("oData");
            var sPath = oButton.getParent().getParent().getBindingContextPath(); //Layout => Cell => Line

            var oMasterRecord = oDataModel.getObject(sPath);
            oMasterRecord.DoCommit = true;
            this._updateMasterRecord(oMasterRecord, oDataModel, "delete")
        },


        onAllowRequests: function (oEvent) {

            var oButton = oEvent.getSource();
            var oDataModel = this.getModel("oData");
            var sPath = oButton.getParent().getParent().getBindingContextPath(); //Layout => Cell => Line
            var oMasterRecord = oDataModel.getObject(sPath);

            if (!this._AllowedRequestZonesDialog) {

                var prefix = this.getView().createId("").replace("--",""); //to use getView() on fragment elements
                var oFormFragment = sap.ui.xmlfragment(prefix, "ilim.pdm2.vacation_planning.view.fragments.AllowedRequestZones", this);

                this._AllowedRequestZonesDialog = new Dialog({
                    title: this.getResourceBundle().getText("masterRecord.allowedZones.Title"),
                    content: oFormFragment,
                    endButton: new Button({
                        text: this.getResourceBundle().getText("masterRecord.allowedZones.CloseButton"),
                        press: function () {
                            this._AllowedRequestZonesDialog.close();
                        }.bind(this)
                    })
                });

                //to get access to the global model
                this.getView().addDependent(this._AllowedRequestZonesDialog);

                var oDialogModel = new JSONModel();

                this._AllowedRequestZonesDialog.setModel(oDialogModel, "allowedZones");
            }

            this._AllowedRequestZonesDialog.bindElement({
                path: sPath,
                model: "oData"
            });

            this._AllowedRequestZonesDialog.getModel("allowedZones").setData({
                PlanYear: oMasterRecord.PlanYear,
                Bukrs: oMasterRecord.Bukrs,
                PersonnelArea: "",
                PersonnelAreaText: ""
            });

            this._AllowedRequestZonesDialog.open();
        },


        addAllowedZone: function () {

            var oComboBox = this.getView().byId("PersonnelAreaSelect");
            var oPersonnelAreasTable = this.getView().byId("PersonnelAreasTable");
            var oBindedData = this._AllowedRequestZonesDialog.getModel("allowedZones").getData();
            var oDataModel = this.getModel("oData");

            var aKeys = oComboBox.getSelectedKeys();
            oDataModel.getDeferredGroups().push("newPersonnelAreas");

            for (var i=0; i < aKeys.length; i++) {
                var oNewArea = {
                    PlanYear: oBindedData.PlanYear,
                    Bukrs: oBindedData.Bukrs,
                    PersonnelArea: aKeys[i],
                    PersonnelAreaText: ""
                };
                oDataModel.create("/AllowedPersaActionsSet", oNewArea, {
                    groupId: "newPersonnelAreas"
                });
            }

            oDataModel.submitChanges({
                groupId: "newPersonnelAreas",
                success: function () {
                    oComboBox.removeAllSelectedItems();
                }
            })
        },


        _postMasterRecord: function () {

            var oData = this._mRecordCreateDialog.getModel("masterRecord").getData();
            var that = this;

            var oDataModel = this.getModel("oData");

            var oNewMasterRecord = {
                Action: "",
                PlanYear: oData.year,
                Bukrs: oData.bukrs,
                VpStatus: "",
                DueDate: oData.deadline,
                MaxPercent: oData.absence,
                Announce: oData.notify,
                RecordId: "",
                DoCommit: true
            };

            oDataModel.create("/MasterRecordSet", oNewMasterRecord, {
                success: function () {
                    that._mRecordCreateDialog.close();
                }
            });

        },


        _updateMasterRecord: function (oObject, oModel, action) {

            switch (action) {
                case "update":
                    oModel.update(
                        "/MasterRecordSet(PlanYear='" + oObject.PlanYear + "',Bukrs='" + oObject.Bukrs + "')",
                        oObject
                    );
                    break;
                case "delete":
                    oModel.remove(
                        "/MasterRecordSet(PlanYear='" + oObject.PlanYear + "',Bukrs='" + oObject.Bukrs + "')",
                        oObject
                    );
                    break;
            }

        }

    });

});