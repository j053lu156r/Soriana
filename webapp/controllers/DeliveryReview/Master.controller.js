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

    var oModel = new this.DelivReview();
    var cfdiModel = new this.CfdiModel();
    return Controller.extend("demo.controllers.DeliveryReview.Master", {
        onInit: function () {
            //this.setDaterangeMaxMin();
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getOwnerComponent().getModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new JSONModel(), "tableDelivReview");
                    this.clearFilters();
	            this.getView().byId("dateRange").setValue("");
                    this.getView().byId('folioRecibo').setValue("");

                    this.getConfigModel().setProperty("/updateFormatsSingle", "xml");
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },
        searchData: function () {
            if (!this.hasAccess(7)) {
                return false;
            }
            var bContinue = false;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var formater = sap.ui.core.format.DateFormat.getDateTimeInstance({ parent: "yyyyMMdd" });
            var datarange = this.getView().byId("dateRange");

            //Fecha de pedido
            var orderStartDate = this.buildSapDate(datarange.getDateValue());
            var orderEndDate = this.buildSapDate(datarange.getSecondDateValue());

            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var vBelnr = this.getView().byId('fact').getValue();
//<!-- Begin of Insert BORTA 23.07.2021 - Filtro para buscar por Folio Factura -->            
            var vXblnr = this.getView().byId('xblnr').getValue();
//<!-- End of Insert BORTA 23.07.2021 - Filtro para buscar por Folio Factura -->            
            var vMblnr = this.getView().byId('folioRecibo').getValue();
            var vConta = this.getView().byId('conta').getSelected();

            if (vLifnr != null && vLifnr != "") {
                bContinue = true;
            } else {
                sap.m.MessageBox.error("El campo proveedor es obligatorio.");
            }

            if (bContinue) {
                if (vBelnr == "") {
                    if (vMblnr == "") {
                        if(vXblnr == ""){
                            if (orderStartDate != "" && orderEndDate != "") {
                                bContinue = true;
                            } else {
                                bContinue = false;
                                sap.m.MessageBox.error("Debe ingresar al menos un criterio de busqueda.");
                            }
                        }else{
                            bContinue = true;
                        }
                    } else {
                        bContinue = true;
                    }
                } else {
                    bContinue = true;
                }
            }

            if (bContinue) {

                var url = "/FacrevnavSet?$expand=FACNAV&$filter=IOption eq '1' and ILifnr eq '" + vLifnr + "'";

                if (vBelnr != "") {
                      url += " and IBelnr eq '" + vBelnr + "'";
                }
                if (orderStartDate != "" && orderEndDate != "") {
                    url += " and IFini eq '" + orderStartDate + "' and IFfin eq '" + orderEndDate + "'";
                }

                if (vMblnr != "") {
                    url += " and IMblnr eq '" + vMblnr + "'";
                }
//Begin of Insert BORTA 23.07.2021  - Filtro para buscar por folio de factura
                if (vXblnr != "") {
                      url += " and IXblnr eq '" + vXblnr + "'";
                }
//End of Insert BORTA 23.07.2021
                if(vConta!= null && vConta){
                      url += " and IConta eq 'X'";
                }
                var dueModel = oModel.getJsonModel(url);              

                var ojbResponse = dueModel.getProperty("/results/0");

                console.log(dueModel); //End of Insert BORTA 23.07.2021

                this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                    "tableDelivReview");

                this.paginate("tableDelivReview", "/FACNAV", 1, 0);

                if(ojbResponse.FACNAV.results.length > 0 ){
                    this.getView().byId("btnLog").setVisible(true);
                }
            }

        },
        openUploadDialog: function () {
            if (!this.hasAccess(45)) {
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
                "Type": "-",
                "Log" : [ {"Uuid": "", "Description": "", "Sts": "" }]
            };

            var docMatList = this.byId("complPagoList").getSelectedItems();

            if(docMatList.length > 0){
                var docMat = docMatList[0].getBindingContext("tableDelivReview").getObject();
                objRequest.Invoice = docMat.Belnr;
                objRequest.Uuid = docMat.ZtfiglUuid;
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
        onExit: function () {

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
            var resource = oEvent.getSource().getBindingContext("tableDelivReview").getPath(),
                line = resource.split("/").slice(-1).pop();

            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var odata = this.getOwnerComponent().getModel("tableDelivReview");
            var results = odata.getProperty("/FACNAV/Paginated/results");          
            
            var docResult = results[line]; //.campo para obtener el campo deseado   
            
            var url = "/FacrevnavSet?$expand=FACLOGNAV&$filter=IOption eq '2'";
                //url+= " and IFolio eq '" + docResult.Sgtxt + "'";
                url+= " and IUuid eq '" + docResult.ZtfiglUuid + "'";

            if (vLifnr != null && vLifnr != ""){
                url += " and ILifnr eq '" + vLifnr + "'";
            }

            var dueModel = oModel.getJsonModel(url);              
            var ojbResponse = dueModel.getProperty("/results/0");

            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),"tableDelivLog");  
            console.log(dueModel);
            
            if(ojbResponse.FACLOGNAV.results.length > 0 ){
                this._createDialog = sap.ui.xmlfragment("DelivLogFragment", "demo.views.DeliveryReview.fragments.DelivLogFragment", this);
                this.getView().addDependent(this._createDialog);
                //sap.ui.core.Fragment.byId("DelivLogFragment", "tableLog").setValue(ojbResponse); 
    
                this._createDialog.open();   
            }
            else{
                sap.m.MessageBox.error(response.EMessage);
            }
        },
        onCancel: function () {
            if (this._createDialog) {
                this._createDialog.close();
                this._createDialog.destroy();
                this._createDialog = undefined;
            }
        },
        clearFilters: function(){
            this.getView().byId("dateRange").setValue(""); 
            this.getView().byId("folioRecibo").setValue(""); 
            this.getView().byId("fact").setValue(""); 
            this.getView().byId("xblnr").setValue(""); 
            this.getView().byId("conta").setSelected(false); 
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                    name : texts.getProperty("/invoice.invoicesheet"),
                    template: {
                        content: "{Xblnr}"
                    }
                },
                {
                    name : texts.getProperty("/invoice.ffactura"),
                    template: {
                        content: "{Belnr}"
                    }
                },
                {
                    name : texts.getProperty("/invoice.invoicedate"),
                    template: {
                        content: "{Bldat}"
                    }
                },
                {
                    name : texts.getProperty("/global.year"),
                    template: {
                        content: "{Gjahr}"
                    }
                },
                {
                    name : texts.getProperty("/invoice.amount"),
                    template: {
                        content: "{Rmwwr}"
                    }
                },
                {
                    name : texts.getProperty("/global.currencyUC"),
                    template: {
                        content: "{Waers}"
                    }
                },
                {
                    name : texts.getProperty("/invoice.uuid"),
                    template: {
                        content: "{ZtfiglUuid}"
                    }
                },
                {
                    name : texts.getProperty("/invoice.order"),
                    template: {
                        content: "{Ebeln}"
                    }
                },
                {
                    name : texts.getProperty("/invoice.receiptsheet"),
                    template: {
                        content: "{Sgtxt}"
                    }
                },
                {
                    name : texts.getProperty("/invoice.status"),
                    template: {
                        content: "{Descripcion4}"
                    }
                }                     
            ];

            this.exportxls('tableDelivReview', '/FACNAV/results', columns);
        },

        createLogExcel: function () {
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey"); 
            var datarange = this.getView().byId("dateRange");

            //Fecha de pedido
            var orderStartDate = this.buildSapDate(datarange.getDateValue());
            var orderEndDate = this.buildSapDate(datarange.getSecondDateValue());

            var url = "/FacrevnavSet?$expand=FACLOGNAV&$filter=IOption eq '2'";
            
            if (vLifnr != null && vLifnr != ""){
                url += " and ILifnr eq '" + vLifnr + "'";
            }

            if (orderStartDate != "" && orderEndDate != "") {
                url += " and IFini eq '" + orderStartDate + "' and IFfin eq '" + orderEndDate + "'";
            }

            var logModel = oModel.getJsonModel(url); 
            var ojbResponseLog = logModel.getProperty("/results/0");

            this.getOwnerComponent().setModel(new JSONModel(ojbResponseLog),"tableDelivLog");  
            console.log(logModel);

            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                    name : texts.getProperty("/invoice.uuid"),
                    template: {
                        content: "{Uuid}"
                    }
                },
                {
                    name : texts.getProperty("/invoice.vendor"),
                    template: {
                        content: "{Proveedor}"
                    }
                },
                {
                    name : texts.getProperty("/invoice.folio"),
                    template: {
                        content: "{FolioId}"
                    }
                },
                {
                    name : texts.getProperty("/invoice.date"),
                    template: {
                        content: "{Fecha}"
                    }
                },
                {
                    name : texts.getProperty("/invoice.hour"),
                    template: {
                        content: "{Hora}"
                    }
                },
                {
                    name : texts.getProperty("/invoice.desc1"),
                    template: {
                        content: "{Descripcion1}"
                    }
                },
                {
                    name : texts.getProperty("/invoice.status"),
                    template: {
                        content: "{Descripcion4}"
                    }
                }            
            ];
            this.exportxls('tableDelivLog', '/FACLOGNAV/results', columns);
        }
    });
});