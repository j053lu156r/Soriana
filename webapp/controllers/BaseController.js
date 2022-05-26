jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/routing/HashChanger",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/Device",
    "sap/ui/core/UIComponent",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
    "demo/models/BaseModel"
], function (Controller, History, HashChanger, Filter, FilterOperator, Fragment, UIComponent, Device) {
    "use strict";
    var oUser = new this.UserModel();
    var inboxModel = new this.MyInbox();
    return Controller.extend("demo.controllers.BaseController", {
        onBeforeRendering: function () {
            var configModel = this.getConfigModel();
            if (configModel != null) {
                var language = configModel.getProperty("/langPortal");
                if (language != null) {
                    this.setLanguage("app" + language, language);
                }
            } else {
                this.setLanguage("appES", "ES");
            }

            // set device model
            var oDeviceModel = new sap.ui.model.json.JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.getOwnerComponent().setModel(oDeviceModel, "device");
            var obj = {

            };
            this.setConfigModel();

        },
        onBeforeShow: function () {
            var router = this.getOwnerComponent().getRouter();
            router.attachRoutePatternMatched(this.onRoutePatternMatched, this);
        },
        onRoutePatternMatched: function (event) {
            var vView = event.getParameter("name");
            if ((!oUser.getModel() || oUser.getModel() === undefined) && vView != 'ConfirmUser') {
                this.getOwnerComponent().getRouter().navTo("appHome", {}, true);
            }
        },
        getUserObject: function () {
            return oUser;
        },
        getUserModel: function () {
            return oUser.getBindingModel();
        },
        setUserModel: function (model) {
            oUser.setBindingModel(model);
            this.getOwnerComponent().setModel(model, "userdata");
        },
        runFunction: function (f, params) {
            window[f](params);
        },
        checkUser: function () {

            var sUserPortalModel = sap.ui.getCore().getModel();
            if (sUserPortalModel === null) {
                this.getOwnerComponent().getRouter().navTo("appHome", {}, true /*no history*/);
            } else {
                var sUserPortal = sap.ui.getCore().getModel().getProperty("/UserPortal");
                if (sUserPortal === null) {
                    this.getOwnerComponent().getRouter().navTo("appHome", {}, true /*no history*/);
                } else {
                    //this.childInit && this.childInit();
                }
            }

        },
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        onNavBack: function (oEvent) {
            var oHistory, sPreviousHash;
            oHistory = History.getInstance();
            sPreviousHash = oHistory.getPreviousHash();

            var sLayout = sap.f.LayoutType.OneColumn;

            this.onExit();
			/*if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {*/
            this.getOwnerComponent().getRouter().navTo("tile", { layout: sLayout }, true /*no history*/);
            //}
        },
        formatDate: function (v) {
            if (v) {
                jQuery.sap.require("sap.ui.core.format.DateFormat");
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "dd-MM-yyyy"
                });
                return oDateFormat.format(new Date(v));
            } else {
                return null;
            }
        },
        formatDateoData: function (v) {
            if (v) {
                jQuery.sap.require("sap.ui.core.format.DateFormat");
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "YYYYMMdd"
                });
                return oDateFormat.format(new Date(v));
            } else {
                return null;
            }
        },
        ReverseDate: function (s) {
            var d = "";
            if (s) {
                d = s.toString();
                if (d.includes('-')) {
                    d = d.substring(8, 10).concat('-').concat(d.substring(5, 7)).concat('-').concat(d.substring(0, 4));
                }
                else {
                    d = d.substring(6, 8).concat('-').concat(d.substring(4, 6)).concat('-').concat(d.substring(0, 4));
                }
            }
            /*            
                    if (s){
                        return s.replace(/^(\d{4})-(\d{2})-(\d{2})$/g,'$3-$2-$1');  
                    }         
            */
            return d;
        },
        formatFloat: function (amount) {
            return parseFloat(amount);
        },
        formatStatus: function (status) {
            switch (status) {
                case 'A':
                    return this.getOwnerComponent().getModel('appTxts').getProperty("/status.active");
                    break;
                case 'R':
                    return this.getOwnerComponent().getModel('appTxts').getProperty("/status.registered");
                    break;
                case 'S':
                    return this.getOwnerComponent().getModel('appTxts').getProperty("/status.solicited");
                    break;
                case 'L':
                    return this.getOwnerComponent().getModel('appTxts').getProperty("/status.locked");
                    break;
                case 'B':
                    return this.getOwnerComponent().getModel('appTxts').getProperty("/status.deleted");
                    break;
            }
        },
        formatUserType: function (rol) {
            switch (rol) {
                case '0001':
                    return this.getOwnerComponent().getModel('appTxts').getProperty("/rol.managerSoriana");
                    break;
                case '0002':
                    return this.getOwnerComponent().getModel('appTxts').getProperty("/rol.admSupplier");
                    break;
                case '0003':
                    return this.getOwnerComponent().getModel('appTxts').getProperty("/rol.supplier");
                    break;
                case '0004':
                    return this.getOwnerComponent().getModel('appTxts').getProperty("/rol.collabSoriana");
                    break;
            }
        },
        defineSpras: function () {
            var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
            var spras;
            if (sCurrentLocale.includes("-")) {
                var part = sCurrentLocale.split("-");
                spras = part[0];
            } else {
                spras = sCurrentLocale;
            }
            return spras;
        },
        getUser: function () {
            return oUser.getModel().getProperty("/user");
        },
        logout: function () {
            this.getOwnerComponent().getRouter().navTo("Logout");
        },
        getOdata: function (url) {
            return new sap.ui.model.odata.ODataModel(url, true);
        },
        getOdataXML: function (url, params) {
            return new sap.ui.model.odata.ODataModel(url, params);
        },
        getOdataJsonModel: function (url, odata) {
            // that = this;
            var jsonModel = new sap.ui.model.json.JSONModel();
            odata.read(url, undefined, undefined, false,
                function (oData, response) {
                    jsonModel.setData(oData);

                },
                function (err) {
                    //that.logout();
                });
            return jsonModel;
        },
        setLanguage: function (property, language) {
            var myPropertyBundle = jQuery.sap.properties({
                url: "i18n/" + property + ".properties"
            });

            if (myPropertyBundle) {
                var propModel = new sap.ui.model.json.JSONModel();
                propModel.setData(myPropertyBundle['mProperties']);
                this.getOwnerComponent().setModel(propModel, 'appTxts');

                sap.ui.getCore().getConfiguration().setLanguage(language);

                this.getTilesModel();
            }
        },
        getTilesModel: function () {
            var tilesModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("demo.mock", "/tiles.json"));
            this.getOwnerComponent().setModel(tilesModel, "tilesModel");
            this.getFunctionsNames();
        },
        getFunctionsNames: function () {
            oUser.getJsonModelAsync(
                "/headerAdmSet?$expand=ETFNAMENAV&$filter=IOption eq '26'",
                function (jsonModel, parent) {
                    var data = jsonModel.getData().results[0].ETFNAMENAV;
                    parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(data), "funNames");
                },
                function (parent) {

                },
                this
            )
        },
        onExit: function () {

        },
        buildSapDate: function (dateRange) {
            if (dateRange) {
                var startYear = dateRange.getFullYear();
                var startMonth = dateRange.getMonth();
                startMonth = ("0" + (startMonth + 1)).slice(-2);
                var startDay = dateRange.getDate();
                startDay = ("0" + (startDay)).slice(-2);
                return startYear + startMonth + startDay;
            } else {
                return "";
            }
        },
        selectLanguage: function (oEvent) {
            var textLang = oEvent.getSource().getText();
            var prefLang = textLang.split(" - ")[1];

            if (prefLang) {
                var strLangFile = "app" + prefLang;
                this.setLanguage(strLangFile, prefLang);

                sap.ui.getCore().getConfiguration().setLanguage(prefLang);
                this.getConfigModel().setProperty("/langPortal", prefLang);
                /*if (strLangFile === "appES") {
                    sap.ui.getCore().getConfiguration().setLanguage("ES");
                    this.getView().byId("header0").setTitle("Portal de Proveedores " + dNombre);
                } else if (strLangFile === "appEN") {
                    sap.ui.getCore().getConfiguration().setLanguage("EN");
                    this.getView().byId("header0").setTitle("Suppliers Portal " + dNombre);
                }*/
            }
        },
        onValueHelpRequest: function () {
            var oView = this.getView();
            oUser
            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel({}), "tableItemsUsers");            
            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "demo.fragments.SupplierSelect",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueHelpDialog.then(function (oDialog) {
                oDialog._oCancelButton.setProperty('text', oView.getModel("appTxts").getProperty("/global.btnCancel"));
                oDialog.open();
            });
        },
        onValueHelpRequestquitar: function () {
            var oView = this.getView();
            this.getConfigModel().setProperty("/supplierInput",null);     
            this.getConfigModel().setProperty("/supplierInputKey",null);       
            this.getConfigModel().setProperty("/supplierTitle",null);
        /*    if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "demo.fragments.SupplierSelect",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueHelpDialog.then(function (oDialog) {
               
                oDialog.open();
            });*/
        },
        onValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var usrModel = this.getOwnerComponent().getModel("userdata");
            var filType = usrModel.getProperty("/Esusdata/Zusuasor");

            if (filType != null && filType === "X") {
                this.advanceFilter(usrModel, escape(sValue));
            } else {
                this.singleFilter(escape(sValue));
            }
        },

        onValueHelpClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
                        console.log(oEvent.getSource().getBinding("items"));
            var descBloqueo = ""

            var oList = oEvent.getSource().getBinding("items").oList
            var oReg  = oList[0]

            var bloqueo = oReg ? oReg.BloqueoFlag : ""

        if(bloqueo == "X"){

            descBloqueo="[Bloqueo de pago]"

        }

            oEvent.getSource().getBinding("items").filter([]);

            if (!oSelectedItem) {
                return;
            }


             this.getConfigModel().setProperty("/supplierStatus", descBloqueo);


            var detSupp = this.detailSupplier(oSelectedItem.getTitle());

            this.setActiveLifnr(oSelectedItem.getTitle(), oSelectedItem.getDescription() + descBloqueo, detSupp.Impflag);

        },
        setActiveLifnr: function (key, description, importation) {
            if (key != "") {
                var model = this.getOwnerComponent().getModel();
                var devModel = this.getOwnerComponent().getModel("device");
                var hPhone = devModel.getProperty("/system/phone");
                if (hPhone) {
                    this.getConfigModel().setProperty("/supplierTitle", key);
                } else {
                    this.getConfigModel().setProperty("/supplierTitle", key + " - " + description);
                }

                this.getConfigModel().setProperty("/supplierInput", key + " - " + description);
                this.getConfigModel().setProperty("/supplierInputKey", key);
                this.getConfigModel().setProperty("/supplierInportation", importation);
            }

            this.buildUserTileAuth();
        },
        detailSupplier: function(key){
            var suppList = this.getOwnerComponent().getModel("userdata").getProperty("/ETUSUAPROVNAV/results");

            return suppList.find(element => element.Lifnr == key);
        },
        buildUserTileAuth: function () {
            var userTileAuth = {
                "tiles": [],
                "sections": []
            };

            sap.ui.getCore()
            var sectionsModel = this.getOwnerComponent().getModel("tilesModel").getProperty("/sections");
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var userFunctions = this.getOwnerComponent().getModel('userdata').getProperty("/ETROLUSUANAV/results");
            var hasCollab = this.getOwnerComponent().getModel('userdata').getProperty("/Esusdata/Zusuasor");
            var roluser = this.getOwnerComponent().getModel('userdata').getProperty("/ERol");
            
            


            sectionsModel.forEach(function (section) {
                section.tiles.forEach(function (t) {
                    t.functions.forEach(function (f) {
                        var strFunction = f.idFunction;
                        var rolesPermitidos = f.roles;
                        var continuar = true;
                        if (rolesPermitidos != null){
                             continuar = rolesPermitidos.includes(roluser);
                        }
                        if (continuar){
                            if (hasCollab) {
                                if (strFunction != null) {
                                    var funcValue = userFunctions.find(element => element.Idfuncion == strFunction.toString().padStart(6, "000000"));
                                    
                                }
                            } else {
                                if (strFunction != null) {
                                    var funcValue = userFunctions.find(element => element.Idfuncion == strFunction.toString().padStart(6, "000000") && element.Lifnr == vLifnr);
                                }
                            }
    
                        }

                        if (funcValue != null) {

                            if (!userTileAuth.tiles.includes(t.id)) {
                                userTileAuth.tiles.push(t.id);
                            }

                            if (!userTileAuth.sections.includes(section.title)) {
                                userTileAuth.sections.push(section.title);
                            }
                        }
                    });
                });
            });

            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(userTileAuth), "userTileAuth");

            this.getTilesModel();
        },
        singleFilter: function (sValue) {

            var oFilter = new Filter("Name", FilterOperator.Contains, sValue);

            oEvent.getSource().getBinding("items").filter([oFilter]);
        },
        advanceFilter: function (usrModel, sValue) {
            var oLogon = new UserModel();
            var sMail = usrModel.getProperty("/IMail");
            var response = oLogon.getJsonModel("/headerAdmSet?$expand=ETPROV&$filter=IMail eq '" + sMail + "' and IName eq '" + sValue + "' and IOption eq '22'");

            var respObj = response.getProperty("/results/0");
            if (respObj != null) {
                var suppliers = respObj.ETPROV/*.ETUSUAPROVNAV*/;
                this.getOwnerComponent().getModel('userdata').setProperty("/ETUSUAPROVNAV", suppliers);
            }
        },
        formatTranslate: function (title) {
            var txtModel = this.getOwnerComponent().getModel('appTxts');
            return txtModel.getProperty(title);
        },
        formatTranslate: function (title, idTile) {
            var finalTitle = this.defineTileTitle(title, idTile);
            var txtModel = this.getOwnerComponent().getModel('appTxts');
            return txtModel.getProperty(finalTitle);
        },
        defineTileTitle: function (title, idTile) {
            switch (idTile) {
                case "0030":
                    var usrModel = this.getOwnerComponent().getModel("userdata");
                    if (usrModel != null) {
                        var vRol = usrModel.getProperty("/ERol");
                        if (vRol == "0001" || vRol == "0003" || vRol == "0005") {
                            title = "/tiles.titleClSoriana";
                        }
                    }
                    break;
            }

            return title;
        },
        onTilePress: function (oEvent) {
            var tile = oEvent.getSource().getBindingContext("tilesModel").getObject();

            this.getOwnerComponent().getRouter().navTo(tile.binding);
        },
        hasSectionVisible: function (sectionTitle) {
            var userTileAuth = this.getOwnerComponent().getModel('userTileAuth');

            if (userTileAuth != null) {
                var secitons = userTileAuth.getProperty("/sections");
                if (secitons != null) {
                    return secitons.includes(sectionTitle);
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        hasTileVisible: function (tileID) {
            var userTileAuth = this.getOwnerComponent().getModel('userTileAuth');

            if (userTileAuth != null) {
                var tiles = userTileAuth.getProperty("/tiles");
                if (tiles != null) {                    
                    return tiles.includes(tileID);
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        hasChangeMail: function (oEvent) {
            var element = oEvent.getSource().sId;
            this.validateMail(element)
        },
        validateMail: function (element) {

            var email = this.getView().byId(element).getValue();

            var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

            var bValid = mailregex.test(email);
            if (!bValid) {

                sap.m.MessageBox.error(email + " no es un correo valido");

                this.getView().byId(element).setValueState(sap.ui.core.ValueState.Error);

            } else {
                this.getView().byId(element).setValueState(sap.ui.core.ValueState.Success);
            }

            return bValid;
        },
        hasChangePhone: function (oEvent) {
            var element = oEvent.getSource().sId;

            this.validatePhone(element);
        },
        validatePhone: function (element) {

            var phone = this.getView().byId(element).getValue();

            var phoneregex = /^[+]?([0-9]+[- ]?)?\(?([0-9]+)\)?[- ]?([0-9]+)[- ]?([0-9]+)$/;

            var bValid = phoneregex.exec(phone);
            if (!bValid) {
                sap.m.MessageBox.error(phone + " no es un teléfono valido, use los siguientes formatos."
                    + "\n\nXXXXXXXXXX\nXXX-XXXX-XXX\nXXX XXXX XXX\n+XX(XX)XXXX-XXX\n+XX (XXX) XXXX XXXX");

                this.getView().byId(element).setValueState(sap.ui.core.ValueState.Error);
            } else {
                this.getView().byId(element).setValueState(sap.ui.core.ValueState.Success);
            }

            return bValid;
        },
        hasOnlyNumbers: function (oEvent) {
            

            this.validateOnlyNumbers(oEvent);
        },
        validateOnlyNumbers: function (oEvent) {
            var element = oEvent.getSource().sId;
            var vValue = this.getView().byId(element).getValue();

            if(vValue == ""){
                this.getView().byId(element).setValue("");
            }

            var numbers = /^[0-9]+$/;
            var bValid = vValue.match(numbers);
            if (!bValid) {
                sap.m.MessageBox.error("Solo se permiten numeros en este campo");

                this.getView().byId(element).setValueState(sap.ui.core.ValueState.Error);
            } else {
                this.getView().byId(element).setValueState(sap.ui.core.ValueState.Success);
            }

            return bValid;
        },
        hasAccess: function (f, swShowMsg = true) {
            var bAccess = false;
            var userFunctions = this.getOwnerComponent().getModel('userdata').getProperty("/ETROLUSUANAV/results");
            var hasCollab = this.getOwnerComponent().getModel('userdata').getProperty("/Esusdata/Zusuasor");
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");

            var strFunction = f;
            if (hasCollab) {
                var funcValue = userFunctions.find(element => element.Idfuncion == strFunction.toString().padStart(6, "000000"));
            } else {
                var funcValue = userFunctions.find(element => element.Idfuncion == strFunction.toString().padStart(6, "000000") && element.Lifnr == vLifnr);
            }

            if (funcValue != null) {
                bAccess = true;
            }

            if (!bAccess && swShowMsg) {
                sap.m.MessageBox.error("No tiene autorización para esta función.")
            }

            return bAccess;
        },
        frmBtnDesvVisible: function (esvisible, usr1) {
            //var confiSite = this.getOwnerComponent().getModel("configSite");
           // var disp = confiSite.getProperty("/barVisible");
           if (esvisible && usr1 != "" && usr1 != undefined && usr1 !== null){
            var seve = true;
           }
           
            return ((esvisible && usr1 !== null && usr1 !== "" && usr1 !== undefined));
            // return ((chgUsrRol == '0001' || chgUsrRol == '0005') && usrRol != '0005');
        },
        setConfigModel: function () {
            if (!this.getOwnerComponent().getModel("configSite")) {
                var obj = {
                    "supplierTitle": "",
                    "barVisible": false
                };
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(obj), "configSite");
            }
        },
        getConfigModel: function () {
            return this.getOwnerComponent().getModel("configSite");
        },
        paginate: function (modelName, pTable, iterator, startRow) {
            var modelObj = null;
            if (this.getOwnerComponent().getModel(modelName)) {
                modelObj = this.getOwnerComponent().getModel(modelName);
            } else {
                modelObj = this.getView().getModel(modelName);
            }

            var propertyName = pTable + "/results";
            var oTable = modelObj.getProperty(propertyName);
            var compFilter = {
                "results": []
            };

            if (oTable != null) {
                var paginate = this.definePagination(modelName, pTable);
                var endRow = iterator * paginate;
                for (var i = startRow; i < endRow; i++) {
                    if (oTable[i] != null) {
                        compFilter.results.push(oTable[i]);
                    } else {
                        break;
                    }
                }
            }

            if (oTable != null) {
                if (endRow >= oTable.length) {
                    endRow = startRow + compFilter.results.length;
                }

                modelObj.setProperty(pTable + "/Paginated", compFilter);
                modelObj.setProperty(pTable + "/Paginated/initRow", startRow + 1);
                modelObj.setProperty(pTable + "/Paginated/endRow", endRow);
                modelObj.setProperty(pTable + "/Paginated/iterator", iterator);
                modelObj.setProperty(pTable + "/Paginated/tableLength", oTable.length);
                modelObj.setProperty(pTable + "/Paginated/numPaginate", paginate);
            }
        },
        prevPagination: function (iterator, startRow, modelName, pTable) {
            iterator--;
            var row = startRow - this.definePagination(modelName, pTable) - 1;
            this.paginate(modelName, pTable, iterator, row);
        },
        nextPagination: function (iterator, endRow, modelName, pTable) {
            iterator++;
            this.paginate(modelName, pTable, iterator, endRow);
        },
        paginateValue: function (selectedItem, modelName, pTable) {
            var modelObj = null;
            if (this.getOwnerComponent().getModel(modelName)) {
                modelObj = this.getOwnerComponent().getModel(modelName);
            } else {
                modelObj = this.getView().getModel(modelName);
            }

            var value = selectedItem.getKey();
            modelObj.setProperty(pTable + "/Paginated/numPaginate", value);
            this.paginate(modelName, pTable, 1, 0);
        },
        definePagination: function (modelName, pTable) {
            var modelObj = null;
            if (this.getOwnerComponent().getModel(modelName)) {
                modelObj = this.getOwnerComponent().getModel(modelName);
            } else {
                modelObj = this.getView().getModel(modelName);
            }

            var paginate = modelObj.getProperty(pTable + "/Paginated/numPaginate");
            if (paginate == null) {
                paginate = 10;
            }
            return paginate;
        },
        exportxls: sap.m.Table.prototype.exportData || function (modelName, rowPath, columns, exportType) {

            exportType || (exportType = new sap.ui.core.util.ExportTypeCSV({
                separatorChar: "\t",
                mimeType: "application/vnd.ms-excel",
                charset: "utf-8",
                fileExtension: "xls"
            }));


            var oExport = new sap.ui.core.util.Export({
                exportType: exportType,
                models: this.getOwnerComponent().getModel(modelName),
                rows: {
                    path: rowPath
                },
                columns: columns
            });

            oExport.saveFile().always(function () {
                this.destroy();
            });
        },
        buildColumnsFromTable: function (tableId) {
            var visibleColumns = [];
            var tableColumns = this.getView().byId(tableId).getColumns();
            for (var i = 0; i < tableColumns.length; i++) {
                if (tableColumns[i].getProperty("visible")) {
                    var column = tableColumns[i];
                    visibleColumns.push(tableColumns[i]);
                }
            }

            return visibleColumns;
        },
        configFilterLanguage: function (oFilter) {
            if (oFilter != null) {
                oFilter.addEventDelegate({
                    "onBeforeRendering": function (oEvent) {

                        var searchButton = oEvent.srcControl._oSearchButton;
                        searchButton.bindProperty("text", "appTxts>/fbar.go");

                        var filterButton = oEvent.srcControl._oFiltersButton;
                        filterButton.bindProperty("text", "appTxts>/fbar.adapt");

                        var fRb = oEvent.srcControl._oRb.aPropertyFiles[0];
                        fRb.setProperty("FILTER_BAR_ADAPT_FILTERS_ZERO", this.getOwnerComponent().getModel('appTxts').getProperty("/fbar.adapt"));
                        fRb.setProperty("FILTER_BAR_ADAPT_FILTERS_DIALOG", this.getOwnerComponent().getModel('appTxts').getProperty("/fbar.adapt"));
                    }
                }, this);
            }
        },
        configUploadSet: function (oFilter) {
            if (oFilter != null) {
                oFilter.addEventDelegate({
                    "onBeforeRendering": function (oEvent) {

                        var fRb = oEvent.srcControl._oRb.aPropertyFiles[0];
                        var val1 = this.getOwnerComponent().getModel('appTxts').getProperty("/uploadSet.upload");
                        fRb.setProperty("UPLOADCOLLECTION_UPLOAD", val1);
                        fRb.setProperty("UPLOAD_SET_NO_DATA_TEXT", this.getOwnerComponent().getModel('appTxts').getProperty("/uploadSet.noFiles"));
                        fRb.setProperty("UPLOADCOLLECTION_NO_DATA_DESCRIPTION", this.getOwnerComponent().getModel('appTxts').getProperty("/uploadSet.noDataDesc"));

                        //oEvent.srcControl._oFileUploader.setButtonText(val1);
                    }
                }, this);
            }
        },
        setIconAttach: function (docType) {
            var icon = "";
            switch (docType) {
                case 'application/pdf':
                    icon = "sap-icon://pdf-attachment";
                    break;
                case 'image/jpeg':
                case 'image/png':
                    icon = "sap-icon://attachment-photo";
                    break;
                case 'text/plain':
                    icon = 'sap-icon://attachment-text-file';
                    break;
                case 'application/msword':
                    icon = "sap-icon://doc-attachment";
                    break;
                case 'application/vnd.ms-excel':
                    icon = "sap-icon://excel-attachment";
                    break;
                default:
                    icon = "sap-icon://document";
                    break;
            }
            return icon;
        },
        buildBlobUrl: function (url, type) {
            var parts = url.split(",");
            var decodedPdfContent = atob(parts[1]);
            var byteArray = new Uint8Array(decodedPdfContent.length)
            for (var i = 0; i < decodedPdfContent.length; i++) {
                byteArray[i] = decodedPdfContent.charCodeAt(i);
            }
            var blob = new Blob([byteArray.buffer], { type: type });
            return URL.createObjectURL(blob);
        },
        findFunName: function (funct) {
            var fNames = this.getOwnerComponent().getModel("funNames").getProperty("/results");
            var changeI = funct.toString();
            var name = fNames.find(element => element.Idfuncion === changeI.padStart(6, "000000"));
            if (name != null) {
                return name.Fname;
            } else {
                return changeI;
            }
        },
        getMetric: function (property) {
            var iValue = 0;
            var cfgModel = this.getConfigModel();

            return cfgModel.getProperty(property);
        },
        documentUploadPress: function () {
            var that = this;
            var oFileUploader = sap.ui.core.Fragment.byId("newHelpDocFragment", "fileUploader");
            var detail = sap.ui.core.Fragment.byId("newHelpDocFragment", "description").getValue();
            if (!oFileUploader.getValue() || (detail == null && detail == "")) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));
                return;
            }

            var objRequest = {
                "IOption": "8",
                "IMail": this.getOwnerComponent().getModel("userdata").getProperty("/IMail"),
                "ITDOCAYNAV": []
            };

            var file = oFileUploader.oFileUpload.files[0];

            var oFile = {};
            oFile.Zdescrip = detail;
            oFile.Zarchivo = file.name;
            oFile.Zdoctype = file.type
            var reader = new FileReader();
            reader.onload = function (evn) {
                oFile.Zdocvalue64 = evn.target.result;
                objRequest.ITDOCAYNAV.push(oFile);

                var response = inboxModel.create("/headInboxSet", objRequest);

                if (response != null) {
                    if (response.ESuccess == "X") {
                        oFileUploader.clear();
                        that.onCloseDialog();
                        that.searchData();
                    } else {
                        sap.m.MessageBox.error(response.EMessage);
                    }
                }
            };
            reader.readAsDataURL(file);
        },
        getStatus: function () {
            var oView = this.getView();

            if (!this._pStatusHelpDialog) {
                this._pStatusHelpDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "demo.views.Repartidores.fragments.StatusDealerFragment",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pStatusHelpDialog.then(function (oDialog) {
                oDialog.open();
            });

        },
        onValueStatus: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItems");
            var Status = "";

            if (oSelectedItem != null && oSelectedItem.length > 0) {
                oSelectedItem.forEach(function (item) {
                    Status = item.getProperty("title");
                });

                if (Status == "") {
                    return;
                }
                sap.ui.core.Fragment.byId("CreateDealersFragment", "status").setValue(Status);
                if (this.oDialog) {
                    this.oDialog.close();
                    this.oDialog.destroy();
                    this.oDialog = undefined;
                }
            }
        },
        onSupplierHelpRequest: function () {
            var oView = this.getView();

            if (!this._pValueSupplierHelpDialog) {
                this._pValueSupplierHelpDialog = sap.ui.core.Fragment.load({
                    id: "supplier",
                    name: "demo.views.Repartidores.fragments.SelectSupplierDealerFragment",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueSupplierHelpDialog.then(function (oDialog) {
                oDialog.open();
            });
        },
        onSupplierHelpClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);

            if (!oSelectedItem) {
                return;
            }

            sap.ui.core.Fragment.byId("CreateDealersFragment", "supplier").setValue(oSelectedItem.getTitle());
            if (this.oDialog) {
                this.oDialog.close();
                this.oDialog.destroy();
                this.oDialog = undefined;
            }
        },
        defineHighlight: function (status) {
            switch (status) {
                case "01":
                    return "Error";
                case "03":
                    return "Success";
            }
        },
        downloadAttach: function (url, type) {
            switch (type) {
                case 'application/pdf':
                    this.pdfView(url, type);
                    break;
                default:
                    var _fileurl = this.buildBlobUrl(url, type);
                    sap.m.URLHelper.redirect(_fileurl, true);
                    break;
            }
        },
        helpBranch: function(){
            var oView = this.getView();

            if (!this._brandHelpDialog) {
                this._brandHelpDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "demo.fragments.BrandSelect",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._brandHelpDialog.then(function (oDialog) {
                oDialog.open();
            });
        },
        brandValueHelpSearch: function (oEvent) {
            var strSearch = oEvent.getParameter("value");

            if (strSearch != null && strSearch != "") {
                var response = inboxModel.getJsonModel("/headInboxSet?$expand=ETSTORENAV&$filter= IOption eq '14' and IName eq '" + strSearch + "'");

                if (response != null) {
                    var objResponse = response.getProperty("/results/0");
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), "searchLocations");
                }
            } else {
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "searchLocations");
            }
        }
    });
});