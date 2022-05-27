sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode"
], function (Controller, JSONModel, BindingMode) {
    "use strict";

    return Controller.extend("demo.controllers.VisorNotasEntrada.Master", {

        onInit: function(){
            this.configFilterLanguage(this.getView().byId("filterBar"));

            this._oPropertiesModel = new JSONModel({
				rowsCount: ""
			});
			
			this._oPropertiesModel.setDefaultBindingMode(BindingMode.TwoWay);
			this.getOwnerComponent().setModel(this._oPropertiesModel, "properties");
        },

        onPress: function(oEvent){
            //this.getOwnerComponent().getRouter().navTo("detailVisorNotas", { layout: sap.f.LayoutType.MidColumnFullScreen}, true);
            //this._oPropertiesModel.setProperty("/rowsCount", 10);
        }
    });
});