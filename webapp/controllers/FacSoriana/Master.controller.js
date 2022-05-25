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

    var oModel = new this.FacSoriana();
    var oZipModel = new this.DevoZipModel();
    return Controller.extend("demo.controllers.FacSoriana.Master", {
        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getConfigModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new JSONModel(), "tableItemsFacSoriana");
                    this.clearFilters();
                }
            }, this);
        },
        searchData: function () {
            if (!this.hasAccess(21)) {
                return false;
            }
            var bContinue = false;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var formater = sap.ui.core.format.DateFormat.getDateTimeInstance({ parent: "yyyyMMdd" });
            var dateRange = this.getView().byId("invoiceDay");

            //Fechas de entrega
            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());

            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var vAugbl = this.getView().byId('docno').getValue();

            if (vLifnr != null && vLifnr != "") {
                bContinue = true;
            } else {
                sap.m.MessageBox.error("El campo proveedor es obligatorio.");
            }

            if (bContinue) {
                if (vAugbl == "") {
                    if (startDate != "" && endDate != "") {
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

                var url = "/headSorInvSet?$expand=ETAGDOCNAV,ETDCTDTNAV,ETPMTDCNAV&$filter= IOption eq '1' and ILifnr eq '" + vLifnr + "'";

                if (vAugbl != "") {
                    url += " and IDocnum eq '" + vAugbl + "'";
                }

                if (startDate != "" && endDate != "") {
                    url += " and IScdate eq '" + startDate + "'";
                    url += " and IFcdate eq '" +  endDate + "'";
                }

                var dueModel = oModel.getJsonModel(url);
                if (dueModel != null) {
                    var ojbResponse = dueModel.getProperty("/results/0");

                    this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                        "tableItemsFacSoriana");

                    this.paginate('tableItemsFacSoriana', '/ETPMTDCNAV', 1, 0); // Cambiar por tabla de salida
                    console.log(dueModel);
                }
            }
        },
        onExit: function () {

        },
        downloadButton: function(){
            if (!this.hasAccess(41)) {
                return false;
            }
            var oItem = this.byId("facSorianaTable").getSelectedItems();
            var texts = this.getOwnerComponent().getModel("appTxts");

            //if (oItem != null && oItem.length > 0) {
                var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
                var oRequest = {};
                var url = "";
                var vBudat = "";
                var vAugbl = "";
                var vBukrs = "";
                var Vblnr = "";
                
                

          /*          oItem.forEach(function (item) {
                        var lItem = item.getBindingContext("tableItemsFacSoriana").getObject();
                        var obj = {};

                        vAugbl = lItem.Augbl;
                        vBudat = lItem.Budat;
                        vBukrs = lItem.Bukrs;
                        obj.Zconfact = lItem.Zconfact;
                    });
                vBudat = vBudat.replaceAll("-", "");    
                                       
                //Llamada a la opción 2 - Obtiene número de documento
                url = "/headSorInvSet?$expand=ETAGDOCNAV,ETDCTDTNAV,ETPMTDCNAV&$filter= IOption eq '2' and ILifnr eq '" + vLifnr + "'"
                    + " and IDocnum eq '" + vAugbl + "'"
                    + " and IBudat eq '" +  vBudat + "'"
                    + " and IZbukrs eq '" + vBukrs + "'"

                var dueModelHdr = oModel.getJsonModel(url);
                var ojbResponseHdr = dueModelHdr.getProperty("/results/0");
                this.getOwnerComponent().setModel(new JSONModel(ojbResponseHdr),
                    "facSorianaHdr");             
              
                if (ojbResponseHdr != null) {

                //Se crea model para extraccion Detecno*/

                    vLifnr = "325670"
                // Llamada al oData para extracción de archivos XML y PDF
                    url = "";
                    url = "/EDetecnoSet?$filter=Vblnr eq '" + Vblnr + "'" //+ ojbResponseHdr.Espmthd.Vblnr + "'"
                        + " and Lifnr eq '" + vLifnr + "'"//+ ojbResponseHdr.Espmthd.Lifnr + "'" 
                        + " and Bukrs eq '" + vBukrs + "'" 
                        + " and Budat eq '" + vBudat + "'" 
                        + " &$format=json"     

                        var dueModelZip = oZipModel.getJsonModel(url);
                        
                        if (dueModelZip != null) {
                            var objectResponseZip = dueModelZip.getProperty("/results/0");

                            this.getOwnerComponent().setModel(new JSONModel(objectResponseZip),
                                "zipResult");

                            console.log(dueModelZip);

                            this.downloadAttach("data:@file/zip;base64," + objectResponseZip.Zip , 'application/zip');
                        }
                //}
            //}
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
        clearFilters : function(){
            this.getView().byId("invoiceDay").setValue(""); 
            this.getView().byId("docno").setValue(""); 
        },
        onListItemPress: function (oEvent) {
            var resource = oEvent.getSource().getBindingContext("tableItemsFacSoriana").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("tableItemsFacSoriana");
            var results = odata.getProperty("/ETPMTDCNAV/results"); //Aqui se debe colocar la tabla de salida del Odata

            var docResult = results[line];

            this.getOwnerComponent().getRouter().navTo("detailFacSoriana",
                {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    document: docResult.Augbl,
                    budat: docResult.Budat,
                    zconfact: docResult.Zconfact,
                    bukrs: docResult.Bukrs,
                    lifnr: this.getConfigModel().getProperty("/supplierInputKey"),
                }, true);
        }

    });
});