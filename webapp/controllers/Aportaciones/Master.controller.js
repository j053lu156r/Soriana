sap.ui.define([
    "demo/controllers/BaseController",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "sap/m/library"
], function (Controller, PDFViewer, JSONModel, MessageToast, MessageBox, mobileLibrary) {
    "use strict";

    var oModel = new this.Aportaciones();

	var ButtonType = mobileLibrary.ButtonType;
	var DialogType = mobileLibrary.DialogType;
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

                if (vLifnr == null) {
                    vLifnr = "";
                }

                var url = "AportaSet?$expand=AportaDet&$filter=IOption eq '3' and ILifnr eq '" + vLifnr + "'"; // Se debe validar que el usuario este activo
                ;

                //url += " and IEstatus eq '2'";

                if (vAportacion != "" && vAportacion != null) {
                    url += " and IFolio eq '" + vAportacion + "'";
                }

                /* if (vEstatus != "" && vEstatus != null){
                     url += " and IEstatus eq '" + vEstatus + "'";
                 }*/

                if (startDate != "" && startDate != null) {
                    url += " and IFecInicio eq '" + startDate + "'";
                }

                if (endDate != "" && endDate != null) {
                    url += " and IFecFin eq '" + endDate + "'";
                }

                /*var dueModel = oModel.getJsonModel(url);
                var ojbResponse = dueModel.getProperty("/results/0");
                this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                    "AportacionesHdr");
                this.paginate("AportacionesHdr", "/AportaDet", 1, 0);*/

                this.getView().byId('tableAportaciones').setBusy(true);
                oModel.getJsonModelAsync(
                    url,
                    function (jsonModel, parent) {
                        var objResponse = jsonModel.getProperty("/results/0");

                        if (objResponse != null) {
                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse),
                                "AportacionesHdr");

                            parent.paginate("AportacionesHdr", "/AportaDet", 1, 0);
                        }
                        parent.getView().byId('tableAportaciones').setBusy(false);
                    },
                    function (parent) {
                        parent.getView().byId('tableAportaciones').setBusy(false);
                    },
                    this
                );
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
console.log(line)
            var odata = this.getOwnerComponent().getModel("AportacionesHdr");
            var results = odata.getProperty("/AportaDet/Paginated/results");
            console.log(results)
            
            var docResult = results[line]; //.campo para obtener el campo deseado            
            console.log(docResult)
            
            //this.getOwnerComponent().setModel(new JSONModel(status), "catalogStatus");
            //this.createButton(docResult, true);

            docResult.Concepto = docResult.Concepto.replace (/\//g, "_");
            console.log("4")
            this.getOwnerComponent().getRouter().navTo("detailDetailAporta",
          // this.getOwnerComponent().getRouter().navTo("detailAportaciones",
                {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    folio: docResult.Folio,
                    concepto: docResult.Concepto,
                    gerencia: docResult.GciaCateg,
                    importe: docResult.ImpTotal

                }, true);
                console.log("5")

        },
        clearFilters: function () {
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
        },
        onPressAccept: function (oEvent) {
            var resource = oEvent.getSource().getBindingContext("AportacionesHdr").getPath(),
                line = resource.split("/").slice(-1).pop();

            this._confirmDialog(line);
        },

        _confirmDialog: function (line) {
            var texts = this.getOwnerComponent().getModel("appTxts");
            this._line_approve = line;

            if (!this.oApproveDialog) {
                this.oApproveDialog = new sap.m.Dialog({
                    type: DialogType.Message,
                    title: texts.getProperty("/aportaciones.confirmar"),
                    content: new sap.m.Text({ text: texts.getProperty("/aportaciones.txtConfirmar") }),
                    beginButton: new sap.m.Button({
                        type: ButtonType.Emphasized,
                        text: texts.getProperty("/aportaciones.aprobar"),
                        press: function () {
                            this.oApproveDialog.close();
                            this._approve(this._line_approve);
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: texts.getProperty("/aportaciones.cancelar"),
                        press: function () {
                            this.oApproveDialog.close();
                        }.bind(this)
                    })
                });
            }
            this.oApproveDialog.open();
        },
        _approve: function (line) {

            var aportaModel = this.getOwnerComponent().getModel("AportacionesHdr");
            var results = aportaModel.getProperty("/AportaDet/Paginated/results");
            var docResult = results[line];

            var url = "AportaSet?$expand=AportaDet&$filter=IOption eq '2' and IEstatus eq '4'";

            if (docResult.Folio != "" && docResult.Folio != null) {
                url += " and IFolio eq '" + docResult.Folio + "'";
            }
            
            this.getView().byId('tableAportaciones').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results/0");
                    parent.getView().byId('tableAportaciones').setBusy(false);

                    if (objResponse != null) {
                        if (objResponse.EError == "X") {
                            MessageBox.error(objResponse.EDescripEvent);
                        } else {
                            docResult.Descest = "Autorizado Proveedor";
                            docResult.Zestatus = "4";
                            aportaModel.setProperty("/AportaDet/Paginated/results", results);
                            MessageBox.success(objResponse.EDescripEvent);
                        }
                    }
                },
                function (parent) {
                    parent.getView().byId('tableAportaciones').setBusy(false);
                },
                this
            );
        },
        onPressReject: function (oEvent) {
            var resource = oEvent.getSource().getBindingContext("AportacionesHdr").getPath(),
                line = resource.split("/").slice(-1).pop();

            this._confirmReject(line);
        },
        _confirmReject: function (line) {
            var texts = this.getOwnerComponent().getModel("appTxts");
            this._line_reject = line;

            if (!this.oRejectDialog) {
                this.oRejectDialog = new sap.m.Dialog({
                    type: DialogType.Message,
                    title: texts.getProperty("/aportaciones.rechazar"),
                    content: new sap.m.Text({ text: texts.getProperty("/aportaciones.txtRechazar") }),
                    beginButton: new sap.m.Button({
                        type: ButtonType.Emphasized,
                        text: texts.getProperty("/aportaciones.rechazar"),
                        press: function () {
                            this.oRejectDialog.close();
                            this._confirmReject2(this._line_reject);
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: texts.getProperty("/aportaciones.cancelar"),
                        press: function () {
                            this.oRejectDialog.close();
                        }.bind(this)
                    })
                });
            }
            this.oRejectDialog.open();
        },
        _confirmReject2: function (line) {
            var texts = this.getOwnerComponent().getModel("appTxts");
            this._line_reject = line;

            if (!this.oReject2Dialog) {
                this.oReject2Dialog = new sap.m.Dialog({
                    type: DialogType.Message,
                    title: texts.getProperty("/aportaciones.rechazar"),
                    content: new sap.m.Text({ text: texts.getProperty("/aportaciones.txtRechazarConf") }),
                    beginButton: new sap.m.Button({
                        type: ButtonType.Emphasized,
                        text: texts.getProperty("/aportaciones.aceptar"),
                        press: function () {
                            this.oReject2Dialog.close();
                            this._reject(this._line_reject);
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: texts.getProperty("/aportaciones.cancelar"),
                        press: function () {
                            this.oReject2Dialog.close();
                        }.bind(this)
                    })
                });
            }
            this.oReject2Dialog.open();
        },
        _reject: function (line) {

            var aportaModel = this.getOwnerComponent().getModel("AportacionesHdr");
            var results = aportaModel.getProperty("/AportaDet/Paginated/results");
            var docResult = results[line];

            var url = "AportaSet?$expand=AportaDet&$filter=IOption eq '2' and IEstatus eq '7'";

            if (docResult.Folio != "" && docResult.Folio != null) {
                url += " and IFolio eq '" + docResult.Folio + "'";
            }
            
            this.getView().byId('tableAportaciones').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results/0");
                    parent.getView().byId('tableAportaciones').setBusy(false);

                    if (objResponse != null) {
                        if (objResponse.EError == "X") {
                            MessageBox.error(objResponse.EDescripEvent);
                        } else {
                            docResult.Descest = "Cancelado";
                            docResult.Zestatus = "7";
                            aportaModel.setProperty("/AportaDet/Paginated/results", results);
                            MessageBox.success(objResponse.EDescripEvent);
                        }
                    }
                },
                function (parent) {
                    parent.getView().byId('tableAportaciones').setBusy(false);
                },
                this
            );
        }
    });
});