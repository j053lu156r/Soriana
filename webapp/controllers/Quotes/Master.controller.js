sap.ui.define([
    "demo/controllers/Quotes/wizards/WQuoteCreate",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/f/library',
    "sap/ui/table/RowAction",
    "sap/ui/table/RowActionItem",
    "sap/ui/table/RowSettings",
], function (Controller, JSONModel, fioriLibrary, RowAction, RowActionItem, RowSettings) {
    "use strict";

    var cModel2 = new this.Citas2();
    return Controller.extend("demo.controllers.Quotes.Master", {

        onInit: function () {

            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "quoteConfigModel");
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    if (this.getView().getModel("appoinmentsCatalogs") == null) {
                        this.getCatalogs();
                    }

                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(),
                        "tableQuotesModel");

                    this.clearFilds();
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
            this.getConfigModel().setProperty("/updateFormatsSingle", "xls,xlsx");
        },
        searchData: function () {
            if(!this.hasAccess(30)){
                return
            }
            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(),
                "tableQuotesModel");

            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var vFolio = this.getView().byId("quoteFolioInput").getValue();
            var vFechaRegCita = this.getView().byId("dateRange");

            //Fechas de entrega
            var vIniDate = this.buildSapDate(vFechaRegCita.getDateValue());
            var vEndDate = this.buildSapDate(vFechaRegCita.getSecondDateValue());
            var vTipoCita = this.getView().byId("quoteType").getValue();
            var vStatus = this.getView().byId("quoteStatus").getValue();
            var vTipoUnidad = this.getView().byId("quoteUnitType").getValue();
            var vTipoProduct = this.getView().byId("productType").getValue();
            var vPedido = this.getView().byId("orderInput").getValue();
            var vTurno = this.getView().byId("quoteTurn").getSelectedKey();
            var vBranch = this.getView().byId("branchInput").getValue();

            //Validamos si el proveedor existe
            if (vLifnr == null
                || vLifnr == "") {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.noProvider"));
                return;
            }

            // Validamos si hay datos validos

            if ((vFolio == null || vFolio == "")
                && (vIniDate == null || vIniDate == "" && vEndDate == null || vEndDate == "")) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/quotes.noFolioDates"));
                return;
            }

            // Construimos la url
            var url = `/HeaderCITASSet?$expand=ECITASCONSNAV&$filter= IOption eq '2'`;
            url += ` and IZproveedor eq '${vLifnr}' `;

            if (vFolio != null && vFolio != "") {
                url += ` and IZfolioCita eq '${vFolio}'`;
            }

            if (vIniDate != null && vIniDate != ""
                && vEndDate != null && vEndDate != "") {
                url += ` and IZfechaRegIni eq '${vIniDate}' and IZfechaRegFin eq '${vEndDate}'`;
            }

            if (vTipoCita != null
                && vTipoCita != "") {
                url += ` and IZtipoCita eq '${vTipoCita}'`;
            }

            if (vStatus != null
                && vStatus != "") {
                url += ` and IZstatus eq '${vStatus}'`;
            }

            if (vTipoUnidad != null
                && vTipoUnidad != "") {
                url += ` and IZtipoUnidad eq '${vTipoUnidad}'`;
            }

            if (vTipoProduct != null
                && vTipoProduct != "") {
                url += ` and IZtipoProd eq '${vTipoProduct}'`;
            }

            if (vPedido != null
                && vPedido != "") {
                url += ` and IZpedido eq '${vPedido}'`;
            }

            if (vTurno != null
                && vTurno != "") {
                url += ` and IZturno eq '${vTurno}'`;
            }

            if (vBranch != null
                && vBranch != "") {
                url += ` and IZsucursal eq '${vBranch}'`;
            }

            var dueModel = cModel2.getJsonModel(url);

            if (dueModel != null) {
                var ojbResponse = dueModel.getProperty("/results/0");

                if (ojbResponse != null) {
                    var dates = ojbResponse.ECITASCONSNAV.results.map(function (x) { return new Date(x.Zfecharegcita); })

                    var earliest = new Date(Math.min.apply(null, dates));
                    this.getOwnerComponent().getModel("quoteConfigModel").setProperty("/startDate", earliest);

                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(ojbResponse),
                        "tableQuotesModel");

                    this.paginate("tableQuotesModel", "/ECITASCONSNAV", 1, 0);
                }
            }
        },
        clearFilds: function () {
            this.getView().byId("quoteFolioInput").setValue("");
            this.getView().byId("dateRange").setValue("");
            this.getView().byId("quoteType").setValue("");
            this.getView().byId("quoteStatus").setValue("");
            this.getView().byId("quoteUnitType").setValue("");
            this.getView().byId("productType").setValue("");
            this.getView().byId("orderInput").setValue("");
            this.getView().byId("quoteTurn").setValue("");
            this.getView().byId("branchInput").setValue("");
        },
        getCatalogs: function () {
            var url = "/HeaderCITASSet?$expand=ETIPOCITANAV,ETIPOPRODUCTONAV,ETIPOTURNONAV,ETIPOUNIDADNAV,ETIPOSTATUSNAV&$filter=IOption eq '3'&$format=json";

            var catalogsModel = cModel2.getJsonModel(url);

            if (catalogsModel != null) {

                var response = catalogsModel.getProperty("/results/0");
                this.getView().setModel(new sap.ui.model.json.JSONModel(response), "appoinmentsCatalogs");

                var algo = this.getView().getModel("appoinmentsCatalogs");
            }
        },
        _brandValueHelpConfirm: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var productInput = this.byId("branchInput");
                productInput.setValue(`${oSelectedItem.getTitle()} - ${oSelectedItem.getDescription()}`);
            }
        },
        helpProductType: function (hasCreate) {

            if (this.getConfigModel().getProperty("/supplierInputKey")) {
                var oView = this.getView();

                if (!this._pTypeHelpDialog) {
                    this._pTypeHelpDialog = sap.ui.core.Fragment.load({
                        id: oView.getId(),
                        name: "demo.fragments.ProductTypeSelect",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }

                var url = `/HeaderCITASSet?$expand=ETIPOPRODUCTONAV&$filter=IOption eq '3' and IZproveedor eq '${this.getConfigModel().getProperty("/supplierInputKey")}'`;

                var response = cModel2.getJsonModel(url);

                if (response != null) {
                    var objResponse = response.getProperty("/results/0");
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), "searchProductType");
                }

                this._pTypeHelpDialog.hasCreate = hasCreate;

                this._pTypeHelpDialog.then(function (oDialog) {
                    oDialog.open();
                });
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.noProvider"));
            }
        },
        productTypeValueHelpSearch: function (oEvent) {
            var strSearch = oEvent.getParameter("value");

            if (strSearch != null && strSearch != "") {

            } else {
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "searchProductType");
            }
        },
        _productTypeValueHelpConfirm: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var productInput = null;
                if (this._pTypeHelpDialog.hasCreate) {
                    productInput = this.byId("productTypeC")
                } else {
                    productInput = this.byId("productType")
                };
                productInput.setValue(`${oSelectedItem.getTitle()}`);
            }
        },
        onAppointmentItemPress: function (oEvent) {
            var appointment = oEvent.getParameter("appointment");

            if (appointment != null) {

                var resource = appointment.getBindingContext("tableQuotesModel").getPath();
                var line = resource.split("/").slice(-1).pop();

                var odata = this.getOwnerComponent().getModel("tableQuotesModel");
                var results = odata.getProperty("/ECITASCONSNAV/Paginated/results");

                var document = results[line].ZfolioCita;
                /*var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
                this.getOwnerComponent().getRouter().navTo("detailOrders", { layout: oNextUIState, document: document }, true);*/
                this.getOwnerComponent().getRouter().navTo("detailQuotes", { layout: sap.f.LayoutType.MidColumnFullScreen, document: document }, true);
            }
        },

        onListItemPress: function (oEvent) {
            var resource = oEvent.getSource().getBindingContext("tableQuotesModel").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("tableQuotesModel");
            var results = odata.getProperty("/ECITASCONSNAV/Paginated/results");

            var document = results[line].ZfolioCita;
            /*var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
            this.getOwnerComponent().getRouter().navTo("detailOrders", { layout: oNextUIState, document: document }, true);*/
            this.getOwnerComponent().getRouter().navTo("detailQuotes", { layout: sap.f.LayoutType.MidColumnFullScreen, document: document }, true);
        },

        formatDateQuote: function (v) {
            if (v) {
                jQuery.sap.require("sap.ui.core.format.DateFormat");
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "yyyy-MM-dd"
                });

                var tmpDate = new Date(v);
                tmpDate.setDate(tmpDate.getDate() + 1);
                return tmpDate;
            } else {
                return null;
            }
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");

            var columns = [
                {
                    name: texts.getProperty("/quotes.branch"),
                    template: {
                        content: "{Zsucursal}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.branch"),
                    template: {
                        content: "{Zdescrsucursal}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.quoteFolio"),
                    template: {
                        content: "{ZfolioCita}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.quoteDate"),
                    template: {
                        content: "{Zfecharegcita}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.quoteType"),
                    template: {
                        content: "{ZtipoCita}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.quoteStatus"),
                    template: {
                        content: "{Zstatus}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.productType"),
                    template: {
                        content: "{ZtipoProd}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.unitType"),
                    template: {
                        content: "{ZtipoUnidad}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.turn"),
                    template: {
                        content: "{Zturno}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.turn"),
                    template: {
                        content: "{ZTipoturno}"
                    }
                }
            ];

            this.exportxls('tableQuotesModel', '/ECITASCONSNAV/results', columns);
        },
        openUploadDialog: function () {
            if (!this._uploadDialog) {
                this._uploadDialog = sap.ui.xmlfragment("demo.views.Quotes.UploadQuote", this);
                this.getView().addDependent(this._uploadDialog);
            }
            this._uploadDialog.open();
        },
        onCloseDialogUpload: function () {
            if (this._uploadDialog) {
                this._uploadDialog.destroy();
                this._uploadDialog = null;
            }
        },
        btnValidateFile: function (){
            console.log("Upload file");
        }
    });
});