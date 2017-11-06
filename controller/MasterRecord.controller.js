sap.ui.define([
    "ilim/pdm2/vacation_planning/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "jquery.sap.global",
    "ilim/pdm2/vacation_planning/model/masterRecord",
    "sap/m/Dialog",
    "sap/m/Button"
], function (Controller, JSONModel, $, Formatter, Dialog, Button ) {

    /** Создаёт инстанцию контроллера для управляющей записи
     * @class
     */

    return Controller.extend("ilim.pdm2.vacation_planning.controller.MasterRecord", {
        /**
         * @namespace ilim.pdm2.vacation_planning.MasterRecord
         */

        formatter: Formatter,


        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf ilim.pdm2.vacation_planning.MasterRecord
         */
        onInit: function() {

            // var sServiceUrl = "http://localhost:3000/master_records";
            // var sBUServiceUrl = "http://localhost:3000/balance_units";

            var oModel = new JSONModel();
            // oModel.loadData(sServiceUrl);

            this.setModel(oModel, "data");

            var oBUModel = new JSONModel();
            // oBUModel.loadData(sBUServiceUrl);
            this.setModel(oBUModel, "bukrs");

        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf ilim.pdm2.vacation_planning.MasterRecord
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf ilim.pdm2.vacation_planning.MasterRecord
         */
        //	onAfterRendering: function() {
        //
        //	},

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf ilim.pdm2.vacation_planning.MasterRecord
         */
        //	onExit: function() {
        //
        //	}

        /**
         * Вызывается при нажатии на кнопку "Создать период". Метод проверяет наличие инстанции диалога.
         * Если её нет, то она создётся и присваивается атрибуту createPeriodDialog
         * @param oEvent
         */
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
            var sPath = oButton.getParent().getBindingContextPath();

            var oMasterRecord = oDataModel.getObject(sPath);

            if (oMasterRecord.VpStatus === "CRTD") {
                oMasterRecord.Action = "OPEN"
            } else if (oMasterRecord.VpStatus === "OPEN") {
                oMasterRecord.Action = "CLOSE"
            }

            oMasterRecord.DoCommit = true;
            this._updateMasterRecord(oMasterRecord, oDataModel, sPath)

        },

        /**
         * Обрабатывает событие при редактировании полей в ракурсе CreatePeriod.fragment.xml
         * @param oEvent
         * @memberOf ilim.pdm2.
         */
        onRecordInput: function (oEvent) {
            //TODO добавить проверку на ввод. maxLength не работает с типом ввода Number
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

        _updateMasterRecord: function (oObject, oModel, sPath) {

            oModel.update(
                "/MasterRecordSet(PlanYear='" + oObject.PlanYear + "',Bukrs='" + oObject.Bukrs + "')",
                oObject
            );

        }

    });

});