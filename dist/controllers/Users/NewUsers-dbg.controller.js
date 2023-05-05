sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/Fragment",
    "demo/controllers/BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/routing/Router"
], function (jQuery, Fragment, Controller, UploadCollectionParameter, History, JSONModel) {
    "use strict";


    var oLogon = new this.UserModel();
    var selectedFunctions = new Map();
    return Controller.extend("demo.controllers.Users.NewUsers", {

        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            this.getView().addEventDelegate({
                onBeforeShow: function (oEvent) {
                    this.onSelectColaborator();
                    this.getOwnerComponent().setModel(new JSONModel(
                        this.getOwnerComponent().getModel("tilesModel").getData()
                    ), "tilesModelLocal");
                    selectedFunctions.clear();
                }
            }, this);
        },
        onExit: function () {
            window.history.go(-1);
        },
        validateData: function () {
            var bReturn = true;
            if (this.getView().byId("Mail").getValue() == "" && this.getView().byId("Mail2").getValue() == "") {
                bReturn = false;
                sap.m.MessageBox.warning("El campo correo y su confirmación son requeridos");
            } else {
                if (this.getView().byId("Mail").getValue() != "" && !this.validateMail("Mail")) {
                    bReturn = false;
                }

                if (this.getView().byId("Mail2").getValue() != "" && !this.validateMail("Mail2")) {
                    bReturn = false;
                }
            }

            if (bReturn && this.getView().byId("Mail").getValue() != this.getView().byId("Mail2").getValue()) {
                bReturn = false;
                sap.m.MessageBox.warning("El correo no coincide, verifique sus entradas");
            }

            if (bReturn && this.getView().byId("Name1").getValue() == "") {
                bReturn = false;
                sap.m.MessageBox.warning("El campo nombre es requerido");
            }

            if (bReturn && (!this.getView().byId("bussUser").getSelected() && !this.getView().byId("callUser").getSelected())) {
                if (this.getConfigModel().getProperty("/supplierInputKey") == null) {
                    bReturn = false;
                    sap.m.MessageBox.warning("Se debe especificar un numero de proveedor");
                }
            }

            if (this.getView().byId("Celular2").getValue() != "") {
                if (!this.validatePhone("Celular2")) {
                    bReturn = false;
                }
            }

            if (this.getView().byId("Tel2").getValue() != "") {
                if (!this.validatePhone("Tel2")) {
                    bReturn = false;
                }
            }

            return bReturn;
        },
        createUser: function () {
            if (this.validateData()) {
                if (!this.getView().byId("bussUser").getSelected()) {
                    var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
                }
                var vMail = this.getView().byId("Mail").getValue();
                var vName1 = this.getView().byId("Name1").getValue();
                var vName2 = this.getView().byId("Name2").getValue();
                var vName3 = this.getView().byId("Name3").getValue();
                var vDepto = this.getView().byId("Depto").getValue();
                var vCel = this.getView().byId("Celular2").getValue();
                var vTel = this.getView().byId("Tel2").getValue();
                var vPuesto = this.getView().byId("Puesto").getValue();
                var vNomJefe = this.getView().byId("Jefe").getValue();
                var vUser = this.getOwnerComponent().getModel("userdata").getProperty("/EIdusua");
                var vCallUser = this.getView().byId("callUser").getSelected();

                var functions = [];
                for (let [key, value] of selectedFunctions) {
                    functions.push({ "Idfuncion": value.toString() });
                }

                var zCallc = "";

                if (vCallUser != "") {
                    zCallc = "X";
                }

                var objUser = {
                    "ILifnr": vLifnr,
                    "IIdusua": vUser,
                    "IOption": "1",
                    "IMail": vMail,
                    "Name1": vName1,
                    "Name2": vName2,
                    "Name3": vName3,
                    "Zpuesto": vPuesto,
                    "Zdepart": vDepto,
                    "TelNumber": vCel,
                    "Znomjefe": vNomJefe,
                    "TelNumber2": vTel,
                    "Zcallc": zCallc,
                    "Spras": "s",
                    "ITFUNCTIONSNAV": functions
                }

                this.sendMessage(objUser);
            }

        },
        sendMessage: function (objUser) {
            var response = oLogon.create("/headerAdmSet", objUser);

            if (response != null) {
                if (response.ESuccess == "X") {
                    sap.m.MessageBox.success("Se ha creado el usuario y enviado la invitación.", {
                        actions: [sap.m.MessageBox.Action.CLOSE],
                        emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                        onClose: function (sAction) {
                            this.goToMainUser();
                        }.bind(this)
                    });
                } else {
                    sap.m.MessageBox.success(response.EMessage);
                }
            } else {
                sap.m.MessageBox.error("No se pudo conectar con el servidor, intente nuevamente.");
            }
        },
        onCancel: function () {
            this.goToMainUser();
        },
        goToMainUser: function () {
            this.oRouter.navTo("masterUsers");
            this.clearFields();
        },
        clearFields: function () {
            this.getView().byId("bussUser").setSelected(false);
            this.getView().byId("Mail").setValue("");
            this.getView().byId("Mail2").setValue("");
            this.getView().byId("Name1").setValue("");
            this.getView().byId("Name2").setValue("");
            this.getView().byId("Name3").setValue("");
            this.getView().byId("Depto").setValue("");
            this.getView().byId("Celular2").setValue("");
            this.getView().byId("Tel2").setValue("");
            this.getView().byId("Puesto").setValue("");
            this.getView().byId("Jefe").setValue("");

            this.getView().byId("Mail").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("Mail2").setValueState(sap.ui.core.ValueState.None);

            this.getView().byId("Celular2").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("Tel2").setValueState(sap.ui.core.ValueState.None);

            /*var functions = [];

            var times = 15;
            for (var i = 0; i <= times; i++) {
                if (this.getView().byId("f-" + i)) {
                    this.getView().byId("f-" + i).setSelected(false);
                }
            }*/
        },
        onSelectColaborator: function () {
            if (this.getView().byId("bussUser").getSelected() || this.getView().byId("callUser").getSelected()) {
                var vLifnr = this.getView().byId("supplierInput").setEnabled(false);
            } else {
                var vLifnr = this.getView().byId("supplierInput").setEnabled(true);
            }
        },
        functionSelected: function (oEvent) {
            var idSource = oEvent.getSource().getId();
            var sPath = oEvent.getSource().getBindingContext("tilesModelLocal").getPath();
            var tileFunct = this.getOwnerComponent().getModel("tilesModelLocal").getProperty(sPath);

            var key = idSource;
            var value = tileFunct.idFunction;


            if (!selectedFunctions.has(key)) {
                selectedFunctions.set(key, value);
            } else {
                selectedFunctions.delete(key);
            }
        }
    });
});