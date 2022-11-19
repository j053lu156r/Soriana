sap.ui.define([
    "jquery.sap.global",
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel"
], function (jQuery, Controller, JSONModel) {
    "use strict";

    // 128-bit key (16 bytes * 8 bits/byte = 128 bits)
    let key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    var oFrame = null;

    return Controller.extend("demo.controllers.PowerBI.Master", {
        onInit: function () {
            this.configFilterLanguage(this.getView().byId("filterBar"));
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.attachRouteMatched(this.routeMatched, this);
            oFrame = this.getView().byId("map_iframe");
        },

        routeMatched: function (oEvent) {
            var oParameters = oEvent.getParameters();
            var sRouteName = oParameters.name;
            var oModel = this.getView().getModel("applicationModel");
            oModel.setProperty("/routeName", sRouteName);
        },

        onExit: function () {
            
        },

        onSuggestionItemSelected: function(vLifnr, user){
            const payload = {
                "Userid": user,
                "IDProveedor": vLifnr
            }
            var payloadBytes = aesjs.utils.utf8.toBytes(JSON.stringify(payload));
            var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
            var encryptedBytes = aesCtr.encrypt(payloadBytes);
            var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
            var oFrameContent = oFrame.$()[0];
            oFrameContent.setAttribute("src", "https://brave-ground-043dfce0f.2.azurestaticapps.net/getReportEmbedded?token=" + encryptedHex);
        }
    });
});