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
                    this.getOwnerComponent().setModel(new JSONModel(),
                    "tableItemsCfdi");

                    this.getConfigModel().setProperty("/updateFormatsSingle", "xml");
                }
            }, this);
        },
        searchData: function () {
            if (!this.hasAccess(2)) {
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
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.supplierSelectError"));
            }

            if (bContinue) {
                if (vXblnr == "") {
                    if (startDate != "" && endDate != "") {
                        bContinue = true;
                    } else {
                        bContinue = false;
                        sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/global.searchFieldsEmpty"));
                    }
                } else {
                    bContinue = true;
                }
            }

            if (bContinue) {
                var url = "/HeaderCFDISet?$expand=EMTDCNAV&$filter=IOption eq '3' and ILifnr eq '" + vLifnr + "'";


                if (vXblnr != "") {
                    url += " and IXblnr eq '" + vXblnr + "'";
                }

                if (startDate != "" && endDate != "") {
                    url += " and IStartdate eq '" + startDate + "'" + " and IEnddate eq '" + endDate + "'";
                }


                var dueModel = oModel.getJsonModel(url);

                var ojbResponse = dueModel.getProperty("/results/0");
                var dueCompModel = ojbResponse.EMTDCNAV.results;

                this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                    "tableItemsCfdi");

                this.paginate('tableItemsCfdi', '/EMTDCNAV', 1, 0);
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
        documentUploadPress: function(){
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
                "Type": "I",
                "Log" : [ {"Uuid": "", "Description": "", "Sts": "" }]
            };

            var docMatList = this.byId("complPagoList").getSelectedItems();

            if(docMatList.length > 0){
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
            if (!this.hasAccess(3)) {
                return false;
            }
            if (!this._uploadDialog3) {
                this._uploadDialog3 = sap.ui.xmlfragment("uploadInvoiceTest", "demo.fragments.UploadInvoice2", this);
                this.getView().addDependent(this._uploadDialog3);
            }
            this._uploadDialog3.open();
        },
        onCloseDialogUpload2: function () {
            if (this._uploadDialog3) {
                this._uploadDialog3.destroy();
                this._uploadDialog3 = null;
            }
        },
        documentUploadPress2: function(){
            var that = this;
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
                    'xmlns:sci="http://www.sci-grupo.com.mx/">' + 
                    '\n<soapenv:Header/>\n<soapenv:Body>\n<sci:RecibeCFD><sci:XMLCFD>' + 
                    '<![CDATA[' + strXML + ']]>\n</sci:XMLCFD>\n</sci:RecibeCFD>\n</soapenv:Body>\n' + 
                    '</soapenv:Envelope>';
                
               const settings = {
                    "async": true,
                    "url": "https://servicioswebsorianaqa.soriana.com/RecibeCFD/wseDocRecibo.asmx",
                    "method": "POST",
                    "headers": {
                        "Content-Type": "text/xml",
                        "Access-Control-Allow-Origin":"*"
                    },
                    "data": body
                };

                $.ajax({
                    async: true,
                    url: "https://servicioswebsorianaqa.soriana.com/RecibeCFD/wseDocRecibo.asmx",
                    method: "POST",
                    headers: {
                        "Content-Type": "text/xml",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "data": body,
                    success: function(response) {
                        sap.ui.core.BusyIndicator.hide();
                        that.onCloseDialogUpload2();
                        oFileUploader.clear();
                        var oXMLModel = new sap.ui.model.xml.XMLModel();  
                        oXMLModel.setXML(response.getElementsByTagName("RecibeCFDResult")[0].textContent);
                        var oXml = oXMLModel.getData();
                        var status = oXml.getElementsByTagName("AckErrorApplication")[0].attributes[5].nodeValue;
                        if (status == "ACCEPTED") {
                            sap.m.MessageBox.success(that.getOwnerComponent().getModel("appTxts").getProperty("/sendInv.SendSuccess"));
                        } else {
                            sap.m.MessageBox.error(oXml.getElementsByTagName("errorDescription")[0].firstChild.textContent);
                        }
                    },
                    error: function(request, status, err) {
                        sap.ui.core.BusyIndicator.hide();
                        that.onCloseDialogUpload2();
                        oFileUploader.clear();
                        sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/sendInv.SendError"));
                    }
                });
            };
            reader2.readAsText(file);
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
        }

    });
});