sap.ui.define([
    'jquery.sap.global',
    "demo/controllers/BaseMetrics",
    'sap/ui/model/json/JSONModel',
    "sap/m/Dialog",
    "demo/models/BaseModel"
], function (jQuery, BaseController, JSONModel) {
    "use strict";

    var vUserVendor = "";
    return BaseController.extend("demo.controllers.Tile", {
        onNext: function () {
            var appId = sap.ui.getCore().byId("myApp");
            appId.to("idView2");
        },
        onInit: function () {


            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getConfigModel();
                    barModel.setProperty("/barVisible", true);

                    this.goMetrics();
                }
            }, this);
        },
        openDateRangeSelection: function(oEvent) {
			this.getView().byId("HiddenDRS").openBy(oEvent.getSource().getDomRef());
		},
        goMetrics: function () {
            this.inboxMetric();
            this.tilesMetrics();
        }
    });
});