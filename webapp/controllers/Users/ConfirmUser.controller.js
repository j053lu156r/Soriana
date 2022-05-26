sap.ui.define([
    "jquery.sap.global",
    "demo/controllers/BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/routing/Router",
    'sap/m/MessageToast'
], function (jQuery, History, Controller, JSONModel, MessageToast) {
    "use strict";

    var oLogon = new this.UserModel();
    var iMail = "";
    return Controller.extend("demo.controllers.Users.ConfirmUser", {
        onInit: function () {
            this.getView().addEventDelegate({
                onBeforeShow: function (oEvent) {
                   // iMail = oEvent.getParameter("arguments").mail;
                   if(iMail== "correo@correo.com"){
                    this.getView().byId("user_confirm").setValue("");
                   }else{
                    this.getView().byId("user_confirm").setValue(iMail);
                   }
                    
                    this.getView().byId("pass1").setValue("");
                    this.getView().byId("pass2").setValue("");
                    this.getView().byId("hCode").setValue("");
                },
                onAfterShow: function() {
                    //gpg comentarie las sig 2 lineas
                    var barModel = this.getOwnerComponent().getModel("configSite");
                    barModel.setProperty("/barVisible", false);
                    
                }
            }, this);

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("ConfirmUser").attachPatternMatched(this._onObjectMatched, this);

            //this.getOwnerComponent().getRouter().navTo("appHome", {}, true /*no history*/);
        },
        activateAccount: function (oEvent) {

            var pass1 = this.getView().byId("pass1").getValue();
            var pass2 = this.getView().byId("pass2").getValue();
            var verfc = this.getView().byId("hCode").getValue();
            iMail = this.getView().byId("user_confirm").getValue();
            iMail = iMail.toUpperCase();
            this.checarConfirmado();
            if (pass1 === pass2) {
                if (pass1.length >= 8) {

                    var bLogon = false;

                    var objRequest = {
                        "IOption": "3",
                        "IMail": iMail,
                        "IAcode": verfc,
                        "INewpass": pass1
                    };

                    var response = oLogon.create("/headerAdmSet", objRequest);

                    if (response != null) {
                        if (response.ESuccess === "X") {
                            this.logon();
                        } else {
                            sap.m.MessageBox.error(response.EMessage);
                        }
                    } else {
                        sap.m.MessageBox.error(this.getOwnerComponent().getModel('appTxts').getProperty("/logon.erroServer"));
                    }
                } else {
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel('appTxts').getProperty("/confirmCon.pass"));
                }
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel('appTxts').getProperty("/confirmCon.error"));
            }
        },
        logon: function () {
            var activForm = this.getView().byId("activeForm");
            var errorBox = this.getView().byId("errorBox");

            activForm.setVisible(false);
            errorBox.setVisible(true);
            var errorField = this.getView().byId("errorField");

            errorField.setText("Se activó la cuenta de forma correcta.");
            errorField.setState(sap.ui.core.ValueState.Success);
        },
        _onObjectMatched: function (oEvent) {
            iMail = oEvent.getParameter("arguments").mail;
           
            var activForm = this.getView().byId("activeForm");
            var errorBox = this.getView().byId("errorBox");
            var errorField = this.getView().byId("errorField");

            activForm.setVisible(true);
            errorBox.setVisible(false);
        
        },
        checarConfirmado: function (){
            
            var objRequest = {
                "IOption": "20",
                "IMail": iMail
            }

            var objResponse = oLogon.create("/headerAdmSet", objRequest);

            var bUser = false;
            var activForm = this.getView().byId("activeForm");
            var errorBox = this.getView().byId("errorBox");
            var errorField = this.getView().byId("errorField");

            bUser = (objResponse != null && objResponse.ESuccess === "X");

            activForm.setVisible(bUser);
            errorBox.setVisible(!bUser);

            if (!bUser) {
                errorField.setText("Lo sentimos el usuario ya fue activado previamente, intente ingresar a su cuenta o en caso de haber olvidado su contraseña presione el link para recuperación.");
                errorField.setState(sap.ui.core.ValueState.Warning);
            }
        },
        backLogin: function () {
            sap.ui.getCore().setModel(null, "logon");
            //window.history.replaceState({}, document.title, "/sap/bc/ui5_ui5/sap/zportalprisma/sendfac/webcontent/" + "index.html");
            this.getOwnerComponent().getRouter().navTo("appHome", {}, true /*no history*/);
        }
    });

});