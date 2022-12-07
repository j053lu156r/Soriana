sap.ui.define([
	"demo/controllers/BaseController",
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("demo.controllers.Users.Logout", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf demo.SendFac.WebContent.controllers.view.Logout
		 */
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(oEvent) {

					if (this.getUserModel()) {
                        this.setUserModel(null);
                        this.getConfigModel();
                        this.getConfigModel().setProperty("/supplierTitle", null);
                        this.getConfigModel().setProperty("/supplierInputKey", null);
                        this.getConfigModel().setProperty("/supplierInput", null);
                        this.getOwnerComponent().setModel(null , "userTileAuth");
                        this.getOwnerComponent().setModel(null , "metrics");
						
						this.getOwnerComponent().getRouter().navTo("appHome", {}, true /*no history*/ );
					}
				}
			}, this);
		}
	});

});