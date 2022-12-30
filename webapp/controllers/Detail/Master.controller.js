sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/Fragment",
    "demo/controllers/BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/mvc/Controller",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/core/routing/Router",
    "demo/models/BaseModel",
    "sap/f/library",
    "sap/ui/core/BusyIndicator"
], function (jQuery, Fragment, Controller, UploadCollectionParameter, History, PDFViewer, JSONModel, fioriLibrary, BusyIndicator) {
    "use strict";

    var tipoUpload = "";
    var oModel = new this.EnvioCfdi();
    var cfdiModel = new this.CfdiModel();
    var oValidFiscales = new this.ValidacionesFiscales();
    var oAdendaSimplificada = new this.AdendaSimplificada();
    var fiscalUrl = "";
    var _oDataModel = "ZOSP_CFDI_SRV_04";
    var _oDataEntity = "HeaderCFDISet";

    return Controller.extend("demo.controllers.Detail.Master", {
        onInit: function () {
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);

            this.oRouter = this.getOwnerComponent().getRouter();
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getConfigModel();
                    barModel.setProperty("/barVisible", true);
                    this.getView().byId("dateRange").setValue("");
                    this.getView().byId("folio").setValue("");
                    //                this.getView().byId("client").setValue("");
                    this.getOwnerComponent().setModel(new JSONModel(), "tableItemsCfdi");

                    this.getConfigModel().setProperty("/updateFormatsSingle", "xml");
                }
            }, this);
            this.fiscalModel = new sap.ui.model.odata.v2.ODataModel(oValidFiscales.sUrl);
        },
        searchData: function () {
            sap.ui.core.BusyIndicator.show(0);
            if (!this.hasAccess(2)) {
                sap.ui.core.BusyIndicator.hide();
                return false;
            }
            var bContinue = false;
            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var formater = sap.ui.core.format.DateFormat.getDateTimeInstance({ parent: "yyyyMMdd" });
            var dateRange = this.getView().byId("dateRange");

            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var vXblnr = this.getView().byId("folio").getValue();
            //         var vWerks = this.getView().byId("client").getSelectedKey();

            if (vLifnr != null && vLifnr != "") {
                bContinue = true;
            } else {
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.supplierSelectError"));
            }

            if (bContinue) {
                if (vXblnr == "") {
                    if (startDate != "" && endDate != "") {
                        bContinue = true;
                    } else {
                        bContinue = false;
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.searchFieldsEmpty"));
                    }
                } else {
                    bContinue = true;
                }
            }

            if (bContinue) {
                var aFilter = [];
                aFilter.push(new sap.ui.model.Filter("IOption", sap.ui.model.FilterOperator.EQ, "3"));
                aFilter.push(new sap.ui.model.Filter("ILifnr", sap.ui.model.FilterOperator.EQ, vLifnr));

                if (vXblnr != "") {
                    aFilter.push(new sap.ui.model.Filter("IXblnr", sap.ui.model.FilterOperator.EQ, vXblnr));
                }

                if (startDate != "" && endDate != "") {
                    aFilter.push(new sap.ui.model.Filter("IStartdate", sap.ui.model.FilterOperator.EQ, startDate));
                    aFilter.push(new sap.ui.model.Filter("IEnddate", sap.ui.model.FilterOperator.EQ, endDate));
                }

                this._GetODataV2(_oDataModel, _oDataEntity, aFilter, ["EMTDCNAV"]).then(resp => {
                    var ojbResponse = resp.data.results[0];
                    this.getOwnerComponent().setModel(new JSONModel(ojbResponse), "tableItemsCfdi");
                    this.paginate('tableItemsCfdi', '/EMTDCNAV', 1, 0);
                    sap.ui.core.BusyIndicator.hide();
                }).catch(error => {
                    sap.ui.core.BusyIndicator.hide();
                });
            }

        },
        onExit: function () {
            if (this._oDialog) {
                this._oDialog.destroy();
                this._oDialog = null;
            }

            if (this._uploadDialog1) {
                this._uploadDialog1.destroy();
                this._uploadDialog1 = null;
            }

            if (this._uploadDialog2) {
                this._uploadDialog2.destroy();
                this._uploadDialog2 = null;
            }

            if (this._oPopover) {
                this._oPopover.destroy();
                this._oPopover = null;
            }
        },
        openUploadDialog: function () {
            if (!this.hasAccess(3)) {
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
            var that = this;
            var oFileUploader = sap.ui.core.Fragment.byId("uploadInvoice", "fileUploader");
            var uploadList = sap.ui.core.Fragment.byId("uploadInvoice", "logUploadList");
            var uploadBox = sap.ui.core.Fragment.byId("uploadInvoice", "uploadBox");
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            sap.ui.core.BusyIndicator.show(0);

            if (!oFileUploader.getValue()) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));
                sap.ui.core.BusyIndicator.hide();
                return;
            }

            var objRequest = {
                "Lifnr": vLifnr,
                "Type": "A",
                "Log": [{ "Uuid": "", "Description": "", "Sts": "" }]
            };

            var docMatList = this.byId("complPagoList").getSelectedItems();

            if (docMatList.length > 0) {
                var docMat = docMatList[0].getBindingContext("tableItemsCfdi").getObject();
                objRequest.Docmat = docMat.Mblnr;
                objRequest.Year = docMat.Gjahr;
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
                    sap.ui.core.BusyIndicator.hide();
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

        openUploadDialog2: function () {
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            if (!this.hasAccess(3)) {
                return false;
            }
            if (vLifnr !== undefined && vLifnr !== null) {
                if (!this._uploadDialog3) {
                    this._uploadDialog3 = sap.ui.xmlfragment("uploadInvoiceTest", "demo.fragments.UploadInvoice2", this);
                    this.getView().addDependent(this._uploadDialog3);
                }
                this._uploadDialog3.open();
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/clarifications.noSupplier"));
            }
        },

        openUploadDialogAdenda: function () {
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            if (!this.hasAccess(3)) {
                return false;
            }
            if (vLifnr !== undefined && vLifnr !== null) {
                if (!this._uploadDialog4) {
                    this._uploadDialog4 = sap.ui.xmlfragment("uploadInvoiceAdenda", "demo.fragments.UploadInvoiceAdenda", this);
                    this.getView().addDependent(this._uploadDialog4);
                }
                this._uploadDialog4.open();
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/clarifications.noSupplier"));
            }
        },

        onCloseDialogUpload2: function () {
            if (this._uploadDialog3) {
                this._uploadDialog3.destroy();
                this._uploadDialog3 = null;
            }
        },

        onCloseDialogUploadAdenda: function () {
            if (this._uploadDialog4) {
                this._uploadDialog4.destroy();
                this._uploadDialog4 = null;
            }
        },

        documentUploadPress2: function () {
            var that = this;
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            console.log(vLifnr);
            var oFileUploader = sap.ui.core.Fragment.byId("uploadInvoiceTest", "fileUploaderTest");
            sap.ui.core.BusyIndicator.show(0);

            if (!oFileUploader.getValue()) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));
                sap.ui.core.BusyIndicator.hide();
                return;
            }

            var file = oFileUploader.oFileUpload.files[0];
            var reader2 = new FileReader();

            reader2.onload = function (evn) {
                var strXML = evn.target.result;

                var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
                    'xmlns:tem="http://tempuri.org/"><soapenv:Header/><soapenv:Body><tem:RecibeCFDPortal>' +
                    '<tem:XMLCFD><![CDATA[' + strXML + ']]></tem:XMLCFD><tem:proveedor>' + vLifnr +
                    '</tem:proveedor></tem:RecibeCFDPortal></soapenv:Body></soapenv:Envelope>';

                $.ajax({
                    async: true,
                    url: oValidFiscales.sUrl,
                    method: "POST",
                    headers: {
                        "Content-Type": "text/xml; charset=utf-8",
                        "Access-Control-Allow-Origin": "*"
                    },
                    data: body,
                    success: function (response) {
                        sap.ui.core.BusyIndicator.hide();
                        that.onCloseDialogUpload2();
                        oFileUploader.clear();
                        var oXMLModel = new sap.ui.model.xml.XMLModel();
                        oXMLModel.setXML(response.getElementsByTagName("RecibeCFDPortalResult")[0].textContent);
                        var oXml = oXMLModel.getData();
                        var status = oXml.getElementsByTagName("AckErrorApplication")[0].attributes[5].nodeValue;
                        var strResponse = oXml.getElementsByTagName("errorDescription")[0].firstChild.textContent;
                        strResponse = strResponse.replaceAll(";", "\n\n");
                        if (status == "ACCEPTED") {
                            sap.m.MessageBox.success(strResponse);
                        } else {
                            sap.m.MessageBox.error(strResponse);
                        }
                    },
                    error: function (request, status, err) {
                        sap.ui.core.BusyIndicator.hide();
                        that.onCloseDialogUpload2();
                        oFileUploader.clear();
                        sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/sendInv.SendError"));
                    }
                });
            };
            reader2.readAsText(file);
        },

        adendaUploadPress: function () {
            var that = this;
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var oFileUploader = sap.ui.core.Fragment.byId("uploadInvoiceAdenda", "fileUploaderAdenda");
            var inptOrder = sap.ui.core.Fragment.byId("uploadInvoiceAdenda", "order");
            sap.ui.core.BusyIndicator.show(0);

            if (!oFileUploader.getValue()) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));
                sap.ui.core.BusyIndicator.hide();
                return;
            }

            if (inptOrder.getValue() == "" || inptOrder.getValue() == null || inptOrder.getValue() == undefined) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.nodata"));
                sap.ui.core.BusyIndicator.hide();
                return;
            }

            var file = oFileUploader.oFileUpload.files[0];
            var reader = new FileReader();
            var order = inptOrder.getValue();

            reader.onload = function (evn) {
                var strXML = evn.target.result;
                var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
                    'xmlns:tem="http://tempuri.org/"><soapenv:Header/><soapenv:Body><tem:RecibeCFDPortal>' +
                    '<tem:XMLCFD><![CDATA[' + strXML + ']]></tem:XMLCFD>' +
                    '<tem:proveedor>' + vLifnr + '</tem:proveedor>' +
                    '<tem:FolioPedido>' + order + '</tem:FolioPedido>' +
                    '</tem:RecibeCFDPortal></soapenv:Body></soapenv:Envelope>';

                $.ajax({
                    async: true,
                    url: oAdendaSimplificada.sUrl,
                    method: "POST",
                    headers: {
                        "Content-Type": "text/xml; charset=utf-8",
                        "Access-Control-Allow-Origin": "*"
                    },
                    data: body,
                    success: function (response) {
                        sap.ui.core.BusyIndicator.hide();
                        that.onCloseDialogUploadAdenda();
                        oFileUploader.clear();
                        var oXMLModel = new sap.ui.model.xml.XMLModel();
                        oXMLModel.setXML(response.getElementsByTagName("RecibeCFDPortalResult")[0].textContent);
                        var oXml = oXMLModel.getData();
                        var status = oXml.getElementsByTagName("AckErrorApplication")[0].attributes[5].nodeValue;
                        var strResponse = oXml.getElementsByTagName("errorDescription")[0].firstChild.textContent;
                        strResponse = strResponse.replaceAll(";", "\n\n");
                        if (status == "ACCEPTED") {
                            sap.m.MessageBox.success(strResponse);
                        } else {
                            sap.m.MessageBox.error(strResponse);
                        }
                    },
                    error: function (request, status, err) {
                        sap.ui.core.BusyIndicator.hide();
                        that.onCloseDialogUploadAdenda();
                        oFileUploader.clear();
                        sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/sendInv.SendError"));
                    }
                });
            };
            reader.readAsText(file);
        },

        filtrado: function (evt) {
            var filterCustomer = [];
            var query = evt.getParameter("query");
            var obFiltro = this.getView().byId("selectFilter");
            var opFiltro = obFiltro.getSelectedKey();
            if (query && query.length > 0) {
                var filter = new sap.ui.model.Filter(opFiltro, sap.ui.model.FilterOperator.Contains, query);
                filterCustomer.push(filter);
            }

            var list = this.getView().byId("complPagoList");
            var binding = list.getBinding("items");
            binding.filter(filterCustomer);
        },
        setDaterangeMaxMin: function () {
            var datarange = this.getView().byId('dateRange');
            var date = new Date();
            var minDate = new Date();
            var minConsultDate = new Date();
            minConsultDate.setDate(date.getDate() - 7);
            minDate.setDate(date.getDate() - 30);
            datarange.setSecondDateValue(date);
            datarange.setDateValue(minConsultDate);
        },
        onListItemPress: function (oEvent) {
            var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
                productPath = oEvent.getSource().getBindingContext("tableItemsCfdi").getPath(),
                line = productPath.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("tableItemsCfdi");
            var results = odata.getProperty("/EMTDCNAV/Paginated/results");

            var document = results[line].Mblnr;
            var year = results[line].Gjahr;

            this.getOwnerComponent().getRouter().navTo("detailCfdi", { layout: oNextUIState.layout, document: document, year: year }, true);
        },

        onGetFiscalUrl: function (oEvent) {
            this.fiscalModel.read("", {
                success: function (response) {
                    console.log(response)
                },
                error: function (error) {
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/sendInv.getUrlError"));
                }
            });
        }
    });
});