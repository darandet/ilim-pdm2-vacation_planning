sap.ui.define(
    [
        "sap/m/Carousel",
        "sap/m/CarouselRenderer"
    ],

    function (Carousel, Renderer) {

        return Carousel.extend("ilim.pdm2.vacation_planning.controls.VacPlanCarousel", {

            metadata: {
                properties: {
                    leftIcon: {
                        type: "string",
                        defaultValue: "slim-arrow-left"
                    },
                    rightIcon: {
                        type: "string",
                        defaultValue: "slim-arrow-right"
                    }
                }
            },

            renderer: "sap.m.CarouselRenderer",

            _getNavigationArrow: function (sName) {
                jQuery.sap.require("sap.ui.core.IconPool");

                var mProperties = {
                    src: this.getProperty(sName + "Icon"),
                    useIconTooltip: false
                };

                if (sName === "left") {
                    if (!this._oArrowLeft) {
                        this._oArrowLeft = sap.m.ImageHelper.getImageControl(this.getId() + "-arrowScrollLeft", this._oArrowLeft, this, mProperties);
                    }
                    return this._oArrowLeft;
                }

                if (sName === "right") {
                    if (!this._oArrowRight) {
                        this._oArrowRight = sap.m.ImageHelper.getImageControl(this.getId() + "-arrowScrollRight", this._oArrowRight, this, mProperties);
                    }
                    return this._oArrowRight;
                }

            }

        })

    });