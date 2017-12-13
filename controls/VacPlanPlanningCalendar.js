sap.ui.define(
    [
        "sap/m/PlanningCalendar"
    ],

    function (PlanningCalendar) {

        return PlanningCalendar.extend("ilim.pdm2.vacation_planning.controls.VacPlanPlanningCalendar", {

            renderer: "sap.m.PlanningCalendarRenderer",

            onBeforeRendering: function () {

                this._bBeforeRendering = true;

                if ((!this._oTimeInterval && !this._oDateInterval && !this._oMonthInterval && !this._oWeekInterval && !this._oOneMonthInterval) || this._bCheckView) {
                    this.setViewKey(this.getViewKey());
                    this._bCheckView = undefined;
                }

                this._updateSelectItems();

                if (this._sUpdateCurrentTime) {
                    jQuery.sap.clearDelayedCall(this._sUpdateCurrentTime);
                    this._sUpdateCurrentTime = undefined;
                }

                this._updateTodayButtonState();

                this._bBeforeRendering = undefined;

            },

            _updateSelectItems: function () {

                var aViews = this.getViews();
                this._oIntervalTypeSelect.destroyItems();
                var i;
                var oItem;

                for (i = 0; i < aViews.length; i++) {
                    var oView = aViews[i];
                    oItem = new sap.ui.core.Item(this.getId() + "-" + i, {
                        key: oView.getKey(),
                        text: oView.getDescription(),
                        tooltip: oView.getTooltip()
                    });
                    this._oIntervalTypeSelect.addItem(oItem);
                }

                this._oIntervalTypeSelect.setVisible(!(aViews.length === 1));

            }

        })

    });