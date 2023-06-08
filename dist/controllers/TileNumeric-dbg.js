sap.ui.define([
    "sap/m/NumericContent"
], function (NumericContent) {
    "use strict";
    return NumericContent.extend("TileNumeric", {
        metadata: {
            properties: {
                "metric": "string"
            },
            events: {
                "press": {}  //  "press" as the normal Button
            }
        },
        onAfterRendering: function (value) {
            // make sure that onAfterRendering function in VBox is not overwritten
            if (NumericContent.prototype.onAfterRendering) {
                NumericContent.prototype.onAfterRendering.apply(this, arguments);
            }
            if (this.getVisible()) {
                if (this.getBindingInfo("value") == null) {
                    this.bindProperty("value", this.getMetric());
                }
            }
        },
        renderer: {}
    });
}); 