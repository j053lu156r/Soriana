sap.ui.define([
    "demo/controllers/BaseController",
    "sap/m/MessageBox",
    "sap/m/PDFViewer"
], function (Controller, MessageBox, PDFViewer) {
    "use strict";

    var oModel = new this.Acuerdos();
    return Controller.extend("demo.controllers.AcuerdosNS.Master", {
        onInit: function () {
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);

            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getOwnerComponent().getModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "AcuerdosHdr");
                    this.clearFilters();
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },
        searchData: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var bContinue = true;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var sociedad = this.getView().byId('sociedadInput').getValue();
            var documento = this.getView().byId('documentoInput').getValue();
            var ejercicio = this.getView().byId('ejercicioInput').getValue();

            if ( documento == "" || documento == null ) {
                MessageBox.error(texts.getProperty("/acuerdosNS.indNo"));
                bContinue = false;
            } else if ( documento != "" && documento != null ) {
                if ( sociedad == "" || sociedad == null ){
                    MessageBox.error(texts.getProperty("/acuerdos.indSoc"));
                    bContinue = false;
                } else if ( ejercicio == "" || ejercicio == null ) {
                    MessageBox.error(texts.getProperty("/acuerdos.indEje"));
                    bContinue = false;
                }
            }

            if (bContinue) {

                var url = "AcuerdosNSSet?$filter=";
                    url += "Bukrs eq '" + sociedad + "'";
                    url += " and Belnr eq '" + documento + "'";
                    url += " and Gjahr eq '" + ejercicio + "'";

                this.getView().byId('tableAcuerdos').setBusy(true);
                oModel.getJsonModelAsync(
                    url,
                    function (jsonModel, parent) {
                        var objResponse = jsonModel.getProperty("/results");

                        if (objResponse != null) {

                            var totBase = objResponse.reduce((a, b) => +a + (+b["Base"] || 0), 0);
                            var totDescto = objResponse.reduce((a, b) => +a + (+b["Desct"] || 0), 0);
                            var totIVA = objResponse.reduce((a, b) => +a + (+b["Iva"] || 0), 0);
                            var totIEPS = objResponse.reduce((a, b) => +a + (+b["Impieps"] || 0), 0);

                            var totalAcuDet = {
                                "TotBase": Number(totBase.toFixed(2)),
                                "TotDescto": Number(totDescto.toFixed(2)),
                                "TotIVA": Number(totIVA.toFixed(2)),
                                "TotIEPS": Number(totIEPS.toFixed(2))
                            };

                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(totalAcuDet), 
                                "acuTotDetModel");

                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse),
                                "AcuerdosHdr");

                            //parent.paginate("AcuerdosHdr", "/AcuerdosDet", 1, 0);
                        }
                        parent.getView().byId('tableAcuerdos').setBusy(false);
                    },
                    function (parent) {
                        parent.getView().byId('tableAcuerdos').setBusy(false);
                    },
                    this
                );
            }

        },
        onExit: function () {

        },

        clearFilters : function(){
            var d = new Date();
            var currentYear = d.getFullYear();

            this.getView().byId("sociedadInput").setValue("2001");
            this.getView().byId("documentoInput").setValue("");
            this.getView().byId("ejercicioInput").setValue(currentYear);
            var oModel = this.getOwnerComponent().getModel("AcuerdosHdr");
            if (oModel) {
                oModel.setData([]);
            }
        },

        buildExportTable: function () {            

            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                 {
                    name: texts.getProperty("/acuerdos.sucursal"),
                    template: {
                        content: "{Werks}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNS.referencia"),
                    template: {
                        content: "{Refer}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.detConv"),
                    template: {
                        content: "{Conve}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.detCveMov"),
                    template: {
                        content: "{Cvemo}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.detFolio"),
                    template: {
                        content: "{Folio}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNS.proveedor"),
                    template: {
                        content: "{Lifnr}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.base"),
                    template: {
                        content: "{Base}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.desc"),
                    template: {
                        content: "{Desct}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.iva"),
                    template: {
                        content: "{Iva}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.pDesc"),
                    template: {
                        content: "{Prdes}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNS.cveFact"),
                    template: {
                        content: "{Cvefac}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNS.indIEPS"),
                    template: {
                        content: "{Bitieps}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNS.ieps"),
                    template: {
                        content: "{Impieps}"
                    }
                }
            ];

            this.exportxls('AcuerdosHdr', '/', columns);
        },

        onListItemPress: function (oEvent) {
            var resource = oEvent.getSource().getBindingContext("AcuerdosHdr").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("AcuerdosHdr");
            var results = odata.getProperty("/");

            var docResult = results[line];

            var sociedad = this.getView().byId("sociedadInput").getValue();
            var documento = this.getView().byId("documentoInput").getValue();
            var ejercicio = this.getView().byId("ejercicioInput").getValue();

            this.getOwnerComponent().getRouter().navTo("detailDetailAcuNS",
                {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    sociedad: sociedad,
                    documento: documento,
                    ejercicio: ejercicio,
                    tienda: docResult.Werks

               }, true);

        },

        onPressPDF: function () {
            /*var oModel = this.getOwnerComponent().getModel("AcuerdosHdr");
            var oData = oModel.getData();
            var sServiceURL = "/sap/opu/odata/sap/ZOSP_ACUERDOS_SRV/";
			var sSource = sServiceURL + "AcuerdosFilesSet('" + oData.UUID + "')/$value";

			this._pdfViewer.setSource(sSource);
			this._pdfViewer.setTitle("CFDI");
			this._pdfViewer.open();*/
        }

    });
});