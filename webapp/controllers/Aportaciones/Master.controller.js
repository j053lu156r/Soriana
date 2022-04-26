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

    var oModel = new this.Aportaciones();
    return Controller.extend("demo.controllers.Aportaciones.Master", {
        onInit: function () {
            //this.setDaterangeMaxMin();
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getOwnerComponent().getModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new JSONModel(), "AportacionesHdr");
                    this.clearFilters();
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },
        searchData: function () {
            var bContinue = true;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var vAportacion = this.getView().byId('aportacionInput').getValue();
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var texts = this.getOwnerComponent().getModel("appTxts");
            var dateRange = this.getView().byId("aportaDay");

            //Fechas de entrega
            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());

            if (bContinue) {

                if(vLifnr == null){
                    vLifnr = "";
                }

                var url = "AportaSet?$expand=AportaDet&$filter=IOption eq '3' and ILifnr eq '" + vLifnr + "'"; // Se debe validar que el usuario este activo
                ;

                url += " and IEstatus eq '2'";

                if (vAportacion != "" && vAportacion != null) {
                    url += " and IFolio eq '" + vAportacion + "'";
                }

               /* if (vEstatus != "" && vEstatus != null){
                    url += " and IEstatus eq '" + vEstatus + "'";
                }*/

                if (startDate != "" && startDate != null){
                    url += " and IFecInicio eq '" + startDate + "'";
                }

                if (endDate != "" && endDate != null){
                    url += " and IFecFin eq '" + endDate + "'";
                }

                var dueModel = oModel.getJsonModel(url);

                var ojbResponse = dueModel.getProperty("/results/0");

                console.log(dueModel);

                this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                    "AportacionesHdr");

                this.paginate("AportacionesHdr", "/AportaDet", 1, 0);
            }

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

            var list = this.getView().byId("AportacionesHdr");
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
            var resource = oEvent.getSource().getBindingContext("AportacionesHdr").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("AportacionesHdr");
            var results = odata.getProperty("/AportaDet/Paginated/results");

            var docResult = results[line]; //.campo para obtener el campo deseado            

            this.getOwnerComponent().setModel(new JSONModel(status), "catalogStatus");

            this.createButton(docResult, true);
        },
        clearFilters : function(){
            this.getView().byId("aportacionInput").setValue("");
            this.getView().byId("supplierInput").setValue("");
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                 {
                    name: texts.getProperty("/aportaciones.folio"),
                    template: {
                        content: "{Folio}"
                    }
                },
                {
                    name: texts.getProperty("/aportaciones.concepto"),
                    template: {
                        content: "{Concepto}"
                    }
                },
                {
                    name: texts.getProperty("/aportaciones.gerencia"),
                    template: {
                        content: "{GciaCateg}"
                    }
                },
                {
                    name: texts.getProperty("/aportaciones.facptura"),
                    template: {
                        content: "{FecCaptura}"
                    }
                },
                {
                    name: texts.getProperty("/aportaciones.fpago"),
                    template: {
                        content: "{FecAport}"
                    }
                },
                {
                    name: texts.getProperty("/aportaciones.importe"),
                    template: {
                        content: "{ImpAport}"
                    }
                },
                {
                    name: texts.getProperty("/aportaciones.estatus"),
                    template: {
                        content: "{Observ}"
                    }
                },                
            ];

            this.exportxls('AportacionesHdr', '/AportaDet/results', columns);
        }

    });
});