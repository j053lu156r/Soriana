sap.ui.define([
    'jquery.sap.global',
    "sap/ui/core/mvc/Controller",
    "demo/controllers/BaseController",
    'sap/ui/core/Fragment',
    'sap/m/MessageToast',
    "sap/ui/model/json/JSONModel"
], function (JQuery, Fragment, Controller, MessageToast, BaseController, JSONModel) {
    "use strict";

    var oModel = new UserModel();
    return Controller.extend("demo.controllers.Users.Logon", {
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        onInit: function () {
            //this.getOwnerComponent().setModel(oModel, "usersModel");

            var llucer = this.getOwnerComponent().getModel('appTxts').getProperty("/logon.llucer");
            var pas = this.getOwnerComponent().getModel('appTxts').getProperty("/logon.pas");

            sap.ui.core.BusyIndicator.show(0);
            sap.ui.core.BusyIndicator.hide();

            var logon_user = this.getView().byId("logon_user");
            var logon_pass = this.getView().byId("logon_pass");
            this.getView().addEventDelegate({
                onBeforeShow: function (oEvent) {
                    logon_user.setValue("");
                    logon_pass.setValue("");
                    this.getView().byId("logon_user").setValueState(sap.ui.core.ValueState.None);
                    this.getConfigModel().setProperty("/barVisible", false);
                }
            }, this);

            logon_user.attachBrowserEvent("keydown", function (evt) {
                if (evt.keyCode === 13) {
                    evt.preventDefault();
                    if (logon_pass.getValue() === "") {
                        logon_pass.focus();
                    }
                }
            }, this);
            logon_pass.attachBrowserEvent("keydown", function (evt) {
                if (evt.keyCode === 13) {
                    evt.preventDefault();
                    this.sendLogin();
                }
            }, this);


        },
        onAfterRendering: function (oEvet) {
            this.cargaParams();
        },
        cargaParams: function () {
            var dFormatoNum = "X";
            sap.ui.getCore().getConfiguration().getFormatSettings().setLegacyNumberFormat(dFormatoNum);
        },
        onExit: function () {
            if (this._oDialog) {
                this._oDialog.destroy();
            }
        },
        setInitialFocus: function (control) {
            this.getView().addEventDelegate({
                onAfterShow: function () {
                    setTimeout(function () {
                        control.focus();
                    }.bind(this), 0);
                }
            }, this);
        },
        onPress: function (oEvent) {
            this.sendLogin();
        },
        sendLogin() {
            var that = this;
            var logon_user = this.getView().byId("logon_user");
            var logon_pass = this.getView().byId("logon_pass");
            var logon_user_value = logon_user.getValue();
            var logon_pass_value = logon_pass.getValue();

            if (logon_user_value !== "") {
                if (logon_pass_value === "") {
                    sap.m.MessageBox.warning(that.getOwnerComponent().getModel('appTxts').getProperty("/logonCon.pass"));
                    logon_pass.focus();
                    return;
                }
            } else {
                sap.m.MessageBox.warning(that.getOwnerComponent().getModel('appTxts').getProperty("/logonCon.user"));
                logon_user.focus();
                return;
            }

            var oLogonJSONModel = new sap.ui.model.json.JSONModel();
            var bLogon = false;


            var response = oModel.getJsonModel("/headerAdmSet?$expand=ETROLUSUANAV,ETUSUAPROVNAV,ETNOMPROVNAV,ETSUPPSNAV&$filter= IOption eq '14' and IMail eq '" + logon_user_value + "' and IPass eq '" + logon_pass_value + "'");
            var respObj = response.getProperty("/results/0");
            if (respObj != null) {
                if (respObj.EAccallow == "X") {
                    oLogonJSONModel.setData(respObj);
                    bLogon = true;
                } else {
                    sap.m.MessageBox.error(respObj.EMessage);
                }
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel('appTxts').getProperty("/logon.erroServer"));
            }
            this.hasLoged(bLogon, oLogonJSONModel);
        },
        hasLoged: function (bLogon, oLogonJSONModel) {
            if (bLogon) {
                var vLifnr = "";
                var vSuppName = "";
                this.setUserModel(oLogonJSONModel);
                if (oLogonJSONModel.getProperty("/Esusdata/Zusuasor") != null && oLogonJSONModel.getProperty("/Esusdata/Zusuasor") != "X") {
                    vLifnr = oLogonJSONModel.getProperty("/ETROLUSUANAV/results/0").Lifnr;
                    var suppDetails = oLogonJSONModel.getProperty("/ETUSUAPROVNAV/results").find(element => element.Lifnr == vLifnr);
                    vSuppName = suppDetails.Name;
                }

                this.setActiveLifnr(vLifnr, vSuppName);
                this.getRouter().navTo("tile");
            }
        },
        onPressCON: function(){
            this.getRouter().navTo("ConfirmUser",{mail:"correo@correo.com"});
        },
        onPressRC: function (oEvent) {

            function validateEmail(email) {
                var re =
                    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(String(email).toLowerCase());
            }

            var email = this.getView().byId("logon_user");

            if (email.getValue() === "") {
                sap.m.MessageBox.warning(this.getOwnerComponent().getModel('appTxts').getProperty("/logonCon.mail"));
            } else {
                if (validateEmail(email.getValue())) {

                    var userExist = 0;
                    var user = oModel.getJsonModel("/headerAdmSet?$expand=ETROLUSUANAV&$filter= IOption eq '14' and IMail eq '" + email.getValue() + "' and IForgpass eq 'X'");
                    var result = user.getProperty("/results/0");

                    if (result != null) {
                        if (result.ESucmail == "X") {

                            if (!this._oDialog || this.oDialog === undefined) {
                                this._oDialog = sap.ui.xmlfragment("demo.fragments.RecoverPass", this);
                            }
                            this.getView().addDependent(this._oDialog);
                            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
                            this._oDialog.open();
                        } else {
                            sap.m.MessageBox.error(result.EMessage);
                        }
                    } else {
                        sap.m.MessageBox.error(this.getOwnerComponent().getModel('appTxts').getProperty("/logonCon.user1") + email.getValue() + this.getOwnerComponent()
                            .getModel('appTxts').getProperty("/logonCon.user2"));
                    }
                } else {
                    sap.m.MessageBox.warning(this.getOwnerComponent().getModel('appTxts').getProperty("/logonCon.noMail"));
                }
            }

        },
        onCloseDialog: function () {
            if (this._oDialog) {
                this._oDialog.destroy();
            }
        },
        verifyCode: function (oEvent) {
            var email = this.getView().byId("logon_user").getValue();
            var verifyInput = sap.ui.getCore().byId("verifyCode");
            var userExist = 0;

            var objRequest = {
                "IOption": "17",
                "IMail": email,
                "IAcode": verifyInput.getValue()
            };

            var respObj = oModel.create("/headerAdmSet", objRequest);

            if (respObj) {
                if (respObj.ESuccess == "X") {
                    sap.ui.getCore().byId("pass1").setVisible(true);
                    sap.ui.getCore().byId("pass2").setVisible(true);
                    sap.ui.getCore().byId("confirmButton").setVisible(true);
                    verifyInput.setVisible(false);
                    sap.ui.getCore().byId("verifyButton").setVisible(false);
                    sap.ui.getCore().byId("textIdentifier").setText("Por favor ingresa y confirma el nuevo password para tu cuenta.");
                } else {
                    sap.m.MessageBox.error(respObj.EMessage);
                }
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel('appTxts').getProperty("/logon.erroServer"));
            }
        },
        changePassword: function () {
            var email = this.getView().byId("logon_user").getValue();
            var pass1 = sap.ui.getCore().byId("pass1").getValue();
            var pass2 = sap.ui.getCore().byId("pass2").getValue();
            var verfc = sap.ui.getCore().byId("verifyCode").getValue();

            if (pass1.length <= 0 || pass1.length < 8) {
                sap.m.MessageBox.warning(this.getOwnerComponent().getModel('appTxts').getProperty("/logonCon.noPass"));
            } else {
                if (pass1 === pass2) {
                    var object = {
                        "IOption": "3",
                        "IMail": email,
                        "IAcode": verfc,
                        "INewpass": pass1
                    };
                    var response = oModel.create("/headerAdmSet", object);

                    if (response != null) {
                        if (response.ESuccess === "X") {
                            sap.ui.getCore().byId("pass1").setVisible(false);
                            sap.ui.getCore().byId("pass2").setVisible(false);
                            sap.ui.getCore().byId("confirmButton").setVisible(false);
                            sap.ui.getCore().byId("objectConfirm").setVisible(true);
                            sap.ui.getCore().byId("textIdentifier").setVisible(false);
                        } else {
                            sap.m.MessageBox.error(response.EMessage);
                        }
                    } else {
                        sap.m.MessageBox.error(this.getOwnerComponent().getModel('appTxts').getProperty("/logon.erroServer"));
                    }
                } else {
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel('appTxts').getProperty("/logonCon.verifyPass"));
                }
            }
        }
    });
});