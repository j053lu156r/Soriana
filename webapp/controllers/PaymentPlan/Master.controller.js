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

    var oModel = new this.PaymentPlan();
    return Controller.extend("demo.controllers.PaymentPlan.Master", {
        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getConfigModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new JSONModel(), "tableItemsPayPlan");
                    this.getView().byId('docno').setValue("");
                    this.getView().byId("datePay").setValue("");
                }
            }, this);
        },
        searchData: function () {
            var bContinue = false;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var formater = sap.ui.core.format.DateFormat.getDateTimeInstance({ parent: "yyyyMMdd" });
            var dateRange = this.getView().byId("datePay");

            //Fechas de engrega
            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());

            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
           // var vBukrs = this.getView().byId('client').getSelectedKey();
            var vVblnr = this.getView().byId('docno').getValue();

            if (vLifnr != null && vLifnr != "") {
                bContinue = true;
            } else {
                sap.m.MessageBox.error("El campo proveedor es obligatorio.");
            }

            if (bContinue) {
                if (vVblnr == "") {
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

                var url = "/EPPLSTSet?$filter= Ioption eq '2' and Lifnr eq '" + vLifnr + "'";

                if (vVblnr != "") {
                    url += " and Ivblnr eq '" + vVblnr + "'";
                }

            /*    if (vBukrs != "") {
                    url += " and IBukrs eq '" + vBukrs + "'";
                }*/
                
                if (startDate != "" && endDate != "") {
                    url += " and Ilaufdi eq '" + startDate + "' and Ilaufdf eq '" + endDate + "'";
                }

                var dueModel = oModel.getJsonModel(url);

                var ojbResponse = dueModel.getProperty("/results");
                //var dueCompModel = ojbResponse.OEKKONAV.results;

                var compFilter = {
                    "TBLPAYS": {
                        "results": []
                    }
                };
                ojbResponse.forEach(function (item) {
                    //if (item.Lifnr === vUserVendor && item.Blart === "KZ") {
                    compFilter.TBLPAYS.results.push(item);
                    //}
                });

                this.getOwnerComponent().setModel(new JSONModel(compFilter),
                    "tableItemsPayPlan");

                this.paginate('tableItemsPayPlan', '/TBLPAYS', 1, 0);
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
            var resource = oEvent.getSource().getBindingContext("tableItemsPayPlan").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("tableItemsPayPlan");
            var results = odata.getProperty("/TBLPAYS/results");

            var docResult = results[line];

            this.getOwnerComponent().getRouter().navTo("detailPayPlan",
                {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    document: docResult.Vblnr,
                    laufd: docResult.Laufd,
                    laufi: docResult.Laufi,
                    zbukr: docResult.Zbukr,
                    lifnr: docResult.Lifnr
                }, true);
        }

    });
});