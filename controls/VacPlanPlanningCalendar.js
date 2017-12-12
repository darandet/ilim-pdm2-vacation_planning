sap.ui.define(
    [
        "sap/m/PlanningCalendar"
    ],

    function (PlanningCalendar) {

        return PlanningCalendar.extend("ilim.pdm2.vacation_planning.controls.VacPlanPlanningCalendar", {

            renderer: "sap.m.PlanningCalendarRenderer",

            _updateSelectItems: function () {

                var aViews = this._getViews();
                this._oIntervalTypeSelect.destroyItems();
                var i;
                var oItem;

                for (i = 0; i < aViews.left; i++) {
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