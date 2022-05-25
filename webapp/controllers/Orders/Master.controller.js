sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/Fragment",
    "demo/controllers/BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/mvc/Controller",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/core/routing/Router",
    "demo/models/BaseModel",
    'sap/f/library'
], function (jQuery, Fragment, Controller, UploadCollectionParameter, History, PDFViewer, JSONModel, fioriLibrary) {
    "use strict";

    var tipoUpload = "";
    var oModel = new this.Pedidostemp();
    var dPersCxP = "";
    var dIdCxP = "";
    var regulaArchivos = true;
    return Controller.extend("demo.controllers.Orders.Master", {
        onInit: function () {
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var filterbar = this.getView().byId("filterBar");

                    var barModel = this.getOwnerComponent().getModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new JSONModel(), "tableItemsOrders");
                    this.clearFilters();

                    this.getConfigModel().setProperty("/updateFormatsSingle", "xml");
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },
        searchData: function () {
            if (!this.hasAccess(1)) {
                return false;
            }

            var bContinue = false;

            if (!oModel.getModel()) {
                oModel.initModel();
            }


            var formater = sap.ui.core.format.DateFormat.getDateTimeInstance({ parent: "yyyyMMdd" });
            var dateRange = this.getView().byId("dateRange");
            var datarange2 = this.getView().byId("dateOrder");
            var datarange3 = this.getView().byId("deliveryDate");

            //Fechas de entrega
            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());
            //Fecha de pedido
            var orderStartDate = this.buildSapDate(datarange2.getDateValue());
            var orderEndDate = this.buildSapDate(datarange2.getSecondDateValue());
            //Fecha de fin entrega
            var delivStartDate = this.buildSapDate(datarange3.getDateValue());
            var delivEndDate = this.buildSapDate(datarange3.getSecondDateValue());

            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var vEbeln = this.getView().byId('order').getValue();
            // Solicitan quitar filtro Cliente - BORTA 27.07.2021
            //var vBukrs = this.getView().byId('client').getSelectedKey();        
            var vClosedOrders = this.getView().byId('closedOrders').getSelected();

            var visible = this.getView().byId("order").getVisible();

            if (vLifnr != null && vLifnr != "") {
                bContinue = true;
            } else {
                sap.m.MessageBox.error("El campo proveedor es obligatorio.");
            }

            if (bContinue) {
                if (vEbeln == "") {
                    if (startDate != "" && endDate != ""
                        || orderStartDate != "" && orderEndDate != ""
                        || delivStartDate != "" && delivEndDate != "") {
                        bContinue = true;
                    } else {
                        bContinue = false;
                        sap.m.MessageBox.error("Debe ingresar al menos un criterio de busqueda.");
                    }
                } else {
                    bContinue = true;
                }
            }

            if (bContinue) {

                var url = "/notCreditSet?$expand=OEKKONAV&$filter=IOption eq '4' and ILifnr eq '" + vLifnr + "'";
                if (vEbeln != "") {
                    url += " and IEbeln eq '" + vEbeln + "'";
                }
                // Solicitan quitar filtro Cliente - BORTA 27.07.2021
                /* if (vBukrs != "") {
                     url += " and IBukrs eq '" + vBukrs + "'";
                 }*/
                if (delivStartDate != "" && delivEndDate != "") {
                    url += " and IKdatb eq '" + delivStartDate + "' and IKdate eq '" + delivEndDate + "'";
                }
                if (orderStartDate != "" && orderEndDate != "") {
                    url += " and IFini eq '" + orderStartDate + "' and IFfin eq '" + orderEndDate + "'";
                }
                if (startDate != "" && endDate != "") {
                    url += " and IEindt eq '" + startDate + "' and IEindf eq '" + endDate + "'";
                }
                if (vClosedOrders != null && vClosedOrders) {
                    url += " and IClose eq 'X'";
                }

                url += "&$top=5&skip=5";

                var dueModel = oModel.getJsonModel(url);

                var ojbResponse = dueModel.getProperty("/results/0");
                var dueCompModel = ojbResponse.OEKKONAV.results;
                console.log(dueModel);

                this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                    "tableItemsOrders");

                this.paginate("tableItemsOrders", "/OEKKONAV", 1, 0);
            }

        },
        onExit: function () {
            if (this._uploadDialog2) {
                this._uploadDialog2.destroy();
                this._uploadDialog2 = null;
            }
        },
        openUploadDialog: function () {
            if (!this.hasAccess(4)) {
                return false;
            }
            if (!this._uploadDialog2) {
                this._uploadDialog2 = sap.ui.xmlfragment("uploadInvoice", "demo.fragments.UploadInvoice", this);
                this.getView().addDependent(this._uploadDialog2);
            }
            this._uploadDialog2.open();
        },
        onCloseDialogUpload: function () {
            if (this._uploadDialog2) {
                this._uploadDialog2.destroy();
                this._uploadDialog2 = null;
            }
        },
        documentUploadPress: function () {
            var oFileUploader = sap.ui.core.Fragment.byId("uploadInvoice", "fileUploader");
            var uploadList = sap.ui.core.Fragment.byId("uploadInvoice", "logUploadList");
            var uploadBox = sap.ui.core.Fragment.byId("uploadInvoice", "uploadBox");
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");

            if (!oFileUploader.getValue()) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));
                return;
            }

            var objRequest = {
                "Lifnr": vLifnr,
                "Type": "",
                "Format": "X",
                "Log": [{ "Uuid": "", "Description": "", "Sts": "" }]
            };

            var docMatList = this.byId("complPagoList").getSelectedItems();

            if (docMatList.length > 0) {
                var docMat = docMatList[0].getBindingContext("tableItemsOrders").getObject();
                objRequest.Docmat = docMat.Ebeln;
            }

            var file = oFileUploader.oFileUpload.files[0];

            var reader = new FileReader();
            reader.onload = function (evn) {
                var obj = {};
                var parts = evn.target.result.split(",");
                obj.Cfdii = parts[1];
                objRequest.Cfdi = parts[1];

                var response = cfdiModel.create("/ECfdiSet ", objRequest);

                if (response != null) {
                    uploadBox.setVisible(false);
                    if (response.Log != null) {
                        uploadList.setVisible(true);
                        uploadList.setModel(new JSONModel(response));
                    } else {
                        sap.m.MessageBox.error(response.EMessage);
                    }
                }
                oFileUploader.clear();
            };
            reader.readAsDataURL(file);
        },
        onListItemPress: function (oEvent) {
            var resource = oEvent.getSource().getBindingContext("tableItemsOrders").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("tableItemsOrders");
            var results = odata.getProperty("/OEKKONAV/Paginated/results");

            var document = results[line].Ebeln;
            /*var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
            this.getOwnerComponent().getRouter().navTo("detailOrders", { layout: oNextUIState, document: document }, true);*/
            this.getOwnerComponent().getRouter().navTo("detailOrders", { layout: sap.f.LayoutType.MidColumnFullScreen, document: document }, true);
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                    name: "Pedidos",
                    template: {
                        content: "{Ebeln}"
                    }
                },
                {
                    name: "Cliente",
                    template: {
                        content: "{Bukrs} - {Butxt}"
                    }
                },
                {
                    name: "Monto",
                    template: {
                        content: "{Netwr}"
                    }
                },
                {
                    name: "Moneda",
                    template: {
                        content: "{Waers}"
                    }
                },
                {
                    name: "Fecha entrega",
                    template: {
                        content: "{Eindt}"
                    }
                },
                {
                    name: texts.getProperty("/order.shipmentend"),
                    template: {
                        content: "{Kdate}"
                    }
                },
                {
                    name: texts.getProperty("/order.ocompra"),
                    template: {
                        content: "{Ekorg}"
                    }
                },
                {
                    name: texts.getProperty("/order.assorment"),
                    template: {
                        content: "{Telf1}"
                    }
                }
            ];

            this.exportxls('tableItemsOrders', '/OEKKONAV/results', columns);
        },
        clearFilters: function () {
            this.getView().byId("dateRange").setValue("");
            this.getView().byId("dateOrder").setValue("");
            this.getView().byId("deliveryDate").setValue("");
            this.getView().byId('order').setValue("");

            // Solicitan quitar filtro Cliente - BORTA 27.07.2021
            //    this.getView().byId('client').setValue("");
            this.getView().byId('closedOrders').setSelected(false);
        }
    });
});