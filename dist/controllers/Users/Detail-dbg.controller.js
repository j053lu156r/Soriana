sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
    "sap/ui/core/mvc/Controller",
    'jquery.sap.global',
    'sap/ui/core/Fragment',
    "demo/models/BaseModel"
], function (JSONModel, Controller) {
    "use strict";

    var oLogon = new this.UserModel();
    var selectedFunctions = new Map();
    var selectedFunctionsExtend = new Map();
    return Controller.extend("demo.controllers.Users.Detail", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailUsers").attachPatternMatched(this._onUserMatched, this);

            
            [oExitButton, oEnterButton].forEach(function (oButton) {
                oButton.addEventDelegate({
                    onAfterRendering: function () {
                        if (this.bFocusFullScreenButton) {
                            this.bFocusFullScreenButton = false;                            
                            oButton.focus();
                        }                        
                    }.bind(this)
                });
            }, this);
        },
        handleHistory: function (oEvent) {
            var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2);
            var supplier = this._supplier;
            if (this._supplier == "") {
                supplier = "-1";
            } else {
                supplier = this._supplier;
            }

            this.oRouter.navTo("historyUsers", {
                layout: oNextUIState.layout,
                user: this._user,
                supplier: supplier
            });
        },
        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            var vSupplier = "";
            if (this._supplier == "") {
                vSupplier = "-1";
            } else {
                vSupplier = this._supplier;
            }

            this.oRouter.navTo("detailUsers", { layout: sNextLayout, user: this._user, supplier: vSupplier });
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            var vSupplier = "";
            if (this._supplier == "") {
                vSupplier = "-1";
            } else {
                vSupplier = this._supplier;
            }

            this.oRouter.navTo("detailUsers", { layout: sNextLayout, user: this._user, supplier: vSupplier });
        },
        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
            this.oRouter.navTo("masterUsers", { layout: sNextLayout });
        },
        _onUserMatched: function (oEvent) {
            this._user = oEvent.getParameter("arguments").user || this._user || "0";
            this._supplier = oEvent.getParameter("arguments").supplier || this._supplier || "0";

            selectedFunctions.clear();

            if (this._supplier == '-1') {
                this._supplier = "";
            }

            this.clearFields();

            var usrModel = oLogon.getJsonModel("/headerAdmSet?$expand=ETNOMPROVNAV,ETUSERFUNCNAV&$filter= IOption eq '9' and IIdusua eq '"
                + this._user + "' and ILifnr eq '" + this._supplier + "'");

            var ojbResponse = usrModel.getProperty("/results/0");

            if (ojbResponse != null) {
                ojbResponse.ETUSERFUNCNAV.results.forEach(function (obj) {
                    this.defineSelectionCB(obj.Idfuncion);
                }, this);

                this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                    "detailUserModel");

                this.getOwnerComponent().setModel(new JSONModel(
                    this.getOwnerComponent().getModel("tilesModel").getData()
                ), "tilesModelLocal");

                //this.adminFields();
            }

        },
        functionSelected: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext("tilesModelLocal").getPath();
            var tileFunct = this.getOwnerComponent().getModel("tilesModelLocal").getProperty(sPath);

            var value = tileFunct.idFunction;

            this.defineSelectionCB(value.toString().padStart(6, "000000"));
        },
        functionSelectedExtended: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext("tilesModelLocal").getPath();
            var tileFunct = this.getOwnerComponent().getModel("tilesModelLocal").getProperty(sPath);

            var value = tileFunct.idFunction;

            this.defineSelectionCBExtend(value.toString().padStart(6, "000000"));
        },
        defineSelectionCB: function (funct) {
            var key = `func-${funct}`;
            if (!selectedFunctions.has(key)) {
                selectedFunctions.set(key, funct);
            } else {
                selectedFunctions.delete(key);
            }
        },
        defineSelectionCBExtend: function (funct) {
            var key = `func-${funct}`;
            if (!selectedFunctionsExtend.has(key)) {
                selectedFunctionsExtend.set(key, funct);
            } else {
                selectedFunctionsExtend.delete(key);
            }
        },
        hasSelected: function (funct) {
            var key = `func-${funct.toString().padStart(6, "000000")}`;
            return selectedFunctions.has(key);
        },
        editUser: function () {
            if (!this.hasAccess(14)) {
                return false;
            }

            var bContinue = true;

            var email = this.getOwnerComponent().getModel("userdata").getProperty("/IMail");
            var objRequest = {
                "IOption": "4",
                "IIdusua": this._user,
                "IMail": email,
                "ILifnr": this._supplier,
                "Name1": this.getView().byId("Name1").getValue(),
                "Name2": this.getView().byId("Name2").getValue(),
                "Name3": this.getView().byId("Name3").getValue(),
                "Zpuesto": this.getView().byId("Puesto").getValue(),
                "Zdepart": this.getView().byId("Depto").getValue(),
                "TelNumber": this.getView().byId("Tel1").getValue(),
                "Znomjefe": this.getView().byId("Jefe").getValue(),
                "TelNumber2": this.getView().byId("Tel2").getValue(),
                "Spras": "s"
            }

            if (objRequest.TelNumber != "") {
                if (!this.validatePhone("Tel1")) {
                    bContinue = false;
                }
            }

            if (objRequest.TelNumber2 != "") {
                if (!this.validatePhone("Tel2")) {
                    bContinue = false;
                }
            }

            if (bContinue) {
                var usrModel = oLogon.create("/headerAdmSet", objRequest);

                if (usrModel != null && usrModel.ESuccess == "X") {
                    this.editFunctions();
                } else {
                    sap.m.MessageBox.error(usrModel.EMessage);
                }
            }
        },
        editFunctions: function () {
            var functions = [];

            for (let [key, value] of selectedFunctions) {
                functions.push({ "Idfuncion": value.toString() });
            }

            var admMail = this.getOwnerComponent().getModel("userdata").getProperty("/IMail");

            this.sendFunctions(this._supplier, functions, admMail);

        },
        sendFunctions: function (supplier, functions, admMail) {

            if (supplier == "" && this.getOwnerComponent().getModel("detailUserModel").getProperty("/Esusdata/Idrol")) {
                supplier = "-1";
            }
            var objRequest = {
                "IOption": "13",
                "IIdusua": this._user,
                "IMail": admMail,
                "ILifnr": supplier,
                "ITFUNCTIONSNAV": functions
            };

            var usrModel = oLogon.create("/headerAdmSet", objRequest);

            if (usrModel != null && usrModel.ESuccess == "X") {
                sap.m.MessageBox.success(usrModel.EMessage);
            } else {
                sap.m.MessageBox.error(usrModel.EMessage);
            }
        },
        extendUserFunctions: function (supplier, functions, admMail) {

            if (supplier == "" && this.getOwnerComponent().getModel("detailUserModel").getProperty("/Esusdata/Idrol")) {
                supplier = "-1";
            }
            var objRequest = {
                "IOption": "23",
                "IIdusua": this._user,
                "IMail": admMail,
                "ILifnr": supplier,
                "ITFUNCTIONSNAV": functions
            };

            var usrModel = oLogon.create("/headerAdmSet", objRequest);

            if (usrModel != null && usrModel.ESuccess == "X") {
                sap.m.MessageBox.success(usrModel.EMessage);
            } else {
                sap.m.MessageBox.error(usrModel.EMessage);
            }
        },
        clearFields: function () {
            this.getView().byId("Name1").setValue("");
            this.getView().byId("Name2").setValue("");
            this.getView().byId("Name3").setValue("");
            this.getView().byId("Depto").setValue("");
            this.getView().byId("Tel1").setValue("");
            this.getView().byId("Tel2").setValue("");
            this.getView().byId("Puesto").setValue("");
            this.getView().byId("Jefe").setValue("");

            this.getView().byId("Tel1").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("Tel2").setValueState(sap.ui.core.ValueState.None);

            var functions = [];

            var times = 15;
            for (var i = 0; i <= times; i++) {
                var changeI = i.toString();
                if (this.getView().byId("f-" + changeI.padStart(6, "000000"))) {
                    this.getView().byId("f-" + changeI.padStart(6, "000000")).setSelected(false);
                }
            }
        },
        sendInv: function () {
            var userMail = this.getOwnerComponent().getModel("detailUserModel").getProperty("/Esusdata/SmtpAddr");
            var admMail = this.getOwnerComponent().getModel("userdata").getProperty("/IMail");

            var response = oLogon.getJsonModel("/headerAdmSet?$expand=ETHISTORINAV&$filter= IOption eq '24' and IMail eq '" + userMail + "' and ICusua eq '" + admMail + "'");
            var respObj = response.getProperty("/results/0");
            if (respObj != null) {
                if (respObj.ESuccess == "X") {
                    sap.m.MessageBox.success(`${this.getOwnerComponent().getModel('appTxts').getProperty("/sendCon.send")} ${userMail}`);
                } else {
                    sap.m.MessageBox.error(respObj.EMessage);
                }
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel('appTxts').getProperty("/logon.erroServer"));
            }
        },
        handleExtendDialog: function () {
            if (!this._oDialog || this.oDialog === undefined) {
                this._oDialog = sap.ui.xmlfragment("extendUserDialog", "demo.fragments.ExtendUser", this);
            }

            selectedFunctionsExtend.clear();
            this.getView().addDependent(this._oDialog);

            // toggle compact style
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
            this._oDialog.open();
        },
        extendDialogClose: function () {
            if (this._oDialog) {
                this._oDialog.destroy();
                this._oDialog == null;
            }
        },
        extendUserSave: function (oEvent) {
            var vSupplier = this.getConfigModel().getProperty("/supplierInputKey");
            var functions = [];

            for (let [key, value] of selectedFunctionsExtend) {
                functions.push({ "Idfuncion": value.toString() });
            }

            var admMail = this.getOwnerComponent().getModel("userdata").getProperty("/IMail");

            this.extendUserFunctions(vSupplier, functions, admMail);

            if (this._oDialog) {
                this._oDialog.destroy();
            }
        },
        handleDropUser: function () {
            if (!this.hasAccess(15)) {
                return false;
            }
            var that = this;

            var dataModel = this.getOwnerComponent().getModel("detailUserModel").getProperty("/Esusdata/Zactivo");
            var msg = "";
            if (dataModel === 'B') {
                msg = `${this.getOwnerComponent().getModel('appTxts').getProperty("/nuser.reactiveUser")}`;
            } else {
                msg = `${this.getOwnerComponent().getModel('appTxts').getProperty("/nuser.dropConfirm")}`;
            }

            sap.m.MessageBox.confirm(msg, {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: sap.m.MessageBox.Action.YES,
                onClose: function (sAction) {
                    if (sAction == sap.m.MessageBox.Action.YES) {
                        that.dropUser();
                    }
                }
            });
        },
        dropUser: function () {
            if (!this.hasAccess(15)) {
                return
            }
            var activeUser = this.getOwnerComponent().getModel('detailUserModel').getProperty("/Esusdata/Zactivo");

            var objRequest = {
                "IOption": "15",
                "IIdusua": this._user,
                "IMail": this.getOwnerComponent().getModel("userdata").getProperty("/IMail"),
                "ITFUNCTIONSNAV": []
            };

            var respObj = oLogon.create("/headerAdmSet", objRequest);

            if (respObj != null) {
                if (respObj.ESuccess == "X") {
                    sap.m.MessageBox.success(respObj.EMessage, {
                        actions: [sap.m.MessageBox.Action.CLOSE],
                        emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                        onClose: function (sAction) {
                            this.oRouter.navTo("masterUsers");
                        }.bind(this)
                    });
                } else {
                    sap.m.MessageBox.error(respObj.EMessage);
                }
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel('appTxts').getProperty("/logon.erroServer"));
            }
        },
        handleChangeToAdmin: function () {
            var that = this;

            var dataModel = this.getOwnerComponent().getModel("detailUserModel").getProperty("/Esusdata/Zactivo");
            var msg = `${this.getOwnerComponent().getModel('appTxts').getProperty("/nuser.confToAdmin")}`;

            var detUsrModel1 = this.getOwnerComponent().getModel('detailUserModel');
            if (detUsrModel1 != null) {
                var rol = detUsrModel1.getProperty("/Esusdata/Idrol");
                if (rol == '0001' || rol == '0002'){
                    msg = `${this.getOwnerComponent().getModel('appTxts').getProperty("/nuser.confToColaborador")}`;
                }
    
            }


            sap.m.MessageBox.confirm(msg, {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: sap.m.MessageBox.Action.YES,
                onClose: function (sAction) {
                    if (sAction == sap.m.MessageBox.Action.YES) {
                        that.changeToAdmin();
                    }
                }
            });
        },
        changeToAdmin: function () {
            var admUser = this.getOwnerComponent().getModel("userdata").getProperty("/Esusdata/SmtpAddr");
            var response = oLogon.getJsonModel("/headerAdmSet?$expand=ETHISTORINAV&$filter=IOption eq '6' and IMail eq '" + admUser + "' and IIdusua eq '" + this._user + "'");

            var respObj = response.getProperty("/results/0");

            if (respObj != null) {
                if (respObj.ESuccess === 'X') {
                    sap.m.MessageBox.success(respObj.EMessage);
                } else {
                    sap.m.MessageBox.error(respObj.EMessage);
                }
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel('appTxts').getProperty("/logon.erroServer"));
            }
        },
        adminFields: function (roles) {
            var detUsrModel = this.getOwnerComponent().getModel('detailUserModel');

            if (detUsrModel != null) {
                var rol = detUsrModel.getProperty("/Esusdata/Idrol");
            }
            var userRol = "";
            var usrModel = this.getOwnerComponent().getModel('userdata');
            if (usrModel != null) {
                userRol = usrModel.getProperty("/ERol");
            }
            var hasAdmin = true;
            if (roles != null) {
                hasAdmin = roles.includes(rol) && roles.includes(userRol);
            }
            this.getOwnerComponent().getModel().setProperty('/userdetailHadmin', hasAdmin);
            hasAdmin = true;  //luego quitar gpg

            return hasAdmin;
        },
        btnChgRolGetName: function (usrRol) {
            return (usrRol != '0001' && usrRol != '0002') ?
                `${this.getOwnerComponent().getModel('appTxts').getProperty('/user.btnChgRol2Adm')}` :
                `${this.getOwnerComponent().getModel('appTxts').getProperty('/user.btnChgRol2Col')}`;
        },
        frmBtnChgRolVisible: function (chgUsrRol, usrRol, usuarioentro, usuarioconsultado) {
           // var usrModel1 = this.getOwnerComponent().getModel("userdata");
           // var detUsrModel1 = this.getOwnerComponent().getModel('detailUserModel');
            return ((usuarioconsultado != usuarioentro));
            //return ((chgUsrRol == '0001' ||  chgUsrRol == '0005') && (usrRol != '0005' && usrRol != '0002' && usrRol != '0001') && (usuarioconsultado != usuarioentro));
            
        },
        frmBtnChgRolVisible2: function (chgUsrRol, usrRol,usuarioentro, usuarioconsultado) {
            return ( (usuarioconsultado != usuarioentro));
            //return ((usrRol != '0005' && usrRol != '0002' && usrRol != '0001')&& (usuarioconsultado != usuarioentro));
        },
        validateIfExist: function () {
            var response = oLogon.getJsonModel();
        },
        handleUnlink: function () {
            var that = this;

            var msg = `Seguro que desea desvincular el proveedor ${this._supplier} de este usuario?`;

            sap.m.MessageBox.confirm(msg, {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: sap.m.MessageBox.Action.YES,
                onClose: function (sAction) {
                    if (sAction == sap.m.MessageBox.Action.YES) {
                        that.unlink();
                    }
                }
            });
        },
        unlink: function () {
            var vLifnr = this._supplier;
            var vUser = this._user;
            var vMail = this.getOwnerComponent().getModel("userdata").getProperty("/IMail");

            var url = "/headerAdmSet?$expand=ETNOMPROVNAV&$filter=IOption eq'25'";

            url += " and ILifnr eq '" + vLifnr + "'";
            url += " and IMail eq '" + vMail + "'";
            url += " and IIdusua eq '" + vUser + "'";

            var response = oLogon.getJsonModel(url);

            var respObj = response.getProperty("/results/0");

            if (respObj != null) {
                if (respObj.ESuccess === 'X') {
                    sap.m.MessageBox.success(respObj.EMessage);
                } else {
                    sap.m.MessageBox.error(respObj.EMessage);
                }
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel('appTxts').getProperty("/logon.erroServer"));
            }
        }
    });
});