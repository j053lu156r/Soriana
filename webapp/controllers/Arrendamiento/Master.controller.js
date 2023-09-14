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
    var oAdendaSimplificadaArr = new this.ArrendamientoAdendaSimplificada();
    var fiscalUrl = "";
    var _oDataModel = "ZOSP_CFDI_ARREN_SRV";
    var _oDataEntity = "EcfdicmsucfolSet";
    var _oDataEntity2 = "EcfdiArrenSet";

    return Controller.extend("demo.controllers.Arrendamiento.Master", {

        // Comentario de prueba

        onInit: function () {
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);

            this.oRouter = this.getOwnerComponent().getRouter();
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getConfigModel();
                    barModel.setProperty("/barVisible", true);
                    this.getView().byId("dateRange").setValue("");

                    this.getOwnerComponent().setModel(new JSONModel(), "tableItemsArren");

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


            if (vLifnr != null && vLifnr != "") {
                bContinue = true;
            } else {
                sap.ui.core.BusyIndicator.hide();
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.supplierSelectError"));
            }



            if (bContinue) {
                var aFilter = [];
              //  aFilter.push(new sap.ui.model.Filter("IOption", sap.ui.model.FilterOperator.EQ, "3"));
                aFilter.push(new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, vLifnr));


                if (startDate != "" && endDate != "") {
                   // aFilter.push(new sap.ui.model.Filter("Dateini", sap.ui.model.FilterOperator.GE, "'"+startDate+"'"));
                   // aFilter.push(new sap.ui.model.Filter("Dateini", sap.ui.model.FilterOperator.LE, "'"+endDate+"'"));
                    aFilter.push(new sap.ui.model.Filter({
                        path: "Zbudat",
                        operator:  sap.ui.model.FilterOperator.BT,
                        value1:  startDate,
                        value2: endDate
                      })
                    )
                }

                this._GetODataV2(_oDataModel, _oDataEntity, aFilter, [] ).then(resp => {
                    var ojbResponse = resp.data.results;
                    for(var x =0;x<ojbResponse.length;x++){
                       
                        var fecha=new Date(ojbResponse[x].Budat)
                        ojbResponse[x].Budat=fecha.toLocaleDateString('ES-MX')
                    }
                    this.getOwnerComponent().setModel(new JSONModel(ojbResponse), "tableItemsArren");
                    this.paginate('tableItemsArren',  1, 0);
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
                var docMat = docMatList[0].getBindingContext("tableItemsArren").getObject();
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

        openUploadDialogAdenda: function (oEvent) {
            var oSelectedItem = oEvent.getSource().getParent();
			var idestadoc = oSelectedItem.getBindingContext("tableItemsArren").getProperty("Xref3");
            console.log(idestadoc)
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            if (!this.hasAccess(3)) {
                return false;
            }
            if (vLifnr !== undefined && vLifnr !== null) {
                if (!this._uploadArrDialog4) {
                    this._uploadArrDialog4 = sap.ui.xmlfragment("uploadInvoiceAdenda", "demo.fragments.UploadArrendamiento", this);
                    this.getView().addDependent(this._uploadArrDialog4);
                }

                this._uploadArrDialog4.open();
                var inptOrder = sap.ui.core.Fragment.byId("uploadInvoiceAdenda", "Folio");
                inptOrder.setValue(idestadoc)
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
            if (this._uploadArrDialog4) {
                this._uploadArrDialog4.destroy();
                this._uploadArrDialog4 = null;
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
      /*  test: function () {

            var oModel2 = "/sap/opu/odata/sap/ZOSP_CFDI_ARREN_SRV";
            var that = this;
            let entidad = "/EcfdiArrenSet";
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var oFileUploader = sap.ui.core.Fragment.byId("uploadInvoiceAdenda", "fileUploaderAdenda");
            var inptOrder = sap.ui.core.Fragment.byId("uploadInvoiceAdenda", "Folio");
            var file = oFileUploader.oFileUpload.files[0];
            var reader = new FileReader();
            var order = inptOrder.getValue();

          

            reader.onload = function (evn) {
                var strXML = evn.target.result;

              //  return new Promise(function (fnResolve, fnReject) {

                    var oModel = new sap.ui.model.odata.v2.ODataModel(oModel2);
                    var body = {
                        "Cfdi": strXML,
                        "Lifnr": vLifnr,
                        "FolioId": order
                    }
                    oModel.setUseBatch(false);
                    oModel.create(entidad, body, {

                        success: function (oData, oResponse) {
                            console.log(oResponse)
                            sap.ui.core.BusyIndicator.hide();
                            this.searchData()
                           // fnResolve(oResponse);
                        },
                        error: function (error) {
                            console.log(error)
                            sap.ui.core.BusyIndicator.hide();
                            sap.m.MessageBox.error("Error: " + error.responseJSON.error.message, {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: "Error"
                            });
                          //  fnReject(new Error(error.message));
                        }
                    });
              //  });
            };
            reader.readAsText(file);

        },*/

        adendaArrUploadPress2: function () {
            var that = this;
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var oFileUploader = sap.ui.core.Fragment.byId("uploadInvoiceAdenda", "fileUploaderAdenda");
            var inptOrder = sap.ui.core.Fragment.byId("uploadInvoiceAdenda", "Folio");
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
                console.log(strXML)

              var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
                    'xmlns:tem="http://tempuri.org/"><soapenv:Header/><soapenv:Body><tem:RecibeCFDPortal>' +
                    '<tem:XMLCFD><![CDATA[' + strXML + ']]></tem:XMLCFD>' +
                    '<tem:proveedor>' + vLifnr + '</tem:proveedor>' +
                    '<tem:FolioCmsucfol>' + order + '</tem:FolioCmsucfol>' +
                    '</tem:RecibeCFDPortal></soapenv:Body></soapenv:Envelope>';
               // console.log(body)

               /* var body = {
                    "Cfdi": strXML,
                    "Lifnr": vLifnr,
                    "FolioId": order
                }*/

               $.ajax({
                    async: true,
                    url: oAdendaSimplificadaArr.sUrl,
                    method: "POST",
                    headers: {
                        "Content-Type": "text/xml; charset=utf-8",
                        "Access-Control-Allow-Origin": "*"
                    },
                    data: body,
                    success: function (response) {
                        console.log(response)
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
                productPath = oEvent.getSource().getBindingContext("tableItemsArren").getPath(),
                line = productPath.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("tableItemsArren");
            var results = odata.getProperty("/EMTDCNAV/Paginated/results");

            var document = results[line].Mblnr;
            var year = results[line].Gjahr;

            this.getOwnerComponent().getRouter().navTo("detailCfdi", { layout: oNextUIState.layout, document: document, year: year }, true);
        },


    });
});