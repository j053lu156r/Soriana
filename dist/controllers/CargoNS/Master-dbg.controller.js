sap.ui.define([
    "demo/controllers/BaseController",
    "sap/m/MessageBox",
    "sap/m/PDFViewer"
], function (Controller, MessageBox, PDFViewer) {
    "use strict";

    var oModel = new this.Acuerdos();
    return Controller.extend("demo.controllers.CargoNS.Master", {
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
            var acuerdo = this.getView().byId('acuerdoInput').getValue();

            if ( ( documento == "" || documento == null ) && ( acuerdo == "" || acuerdo == null ) ) {
                MessageBox.error(texts.getProperty("/acuerdos.indNo"));
                bContinue = false;
            } else if ( ( documento != "" && documento != null ) && ( acuerdo != "" && acuerdo != null ) ) {
                MessageBox.error(texts.getProperty("/acuerdos.soloIndNo"));
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

                var url = "AcuerdosSet?$expand=AcuerdosDet&$filter=";

                if (documento != "" && documento != null) {
                    url += "Sociedad eq '" + sociedad + "'";
                    url += " and Documento eq '" + documento + "'";
                    url += " and Ejercicio eq '" + ejercicio + "'";
                } else if (acuerdo != "" && acuerdo != null) {
                    url += "DoAcuerdo eq '" + acuerdo + "'";
                }

                /*var dueModel = oModel.getJsonModel(url);
                var ojbResponse = dueModel.getProperty("/results/0");
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(ojbResponse),
                    "AcuerdosHdr");
                this.paginate("AcuerdosHdr", "/AcuerdosDet", 1, 0);*/

                this.getView().byId('tableAcuerdos').setBusy(true);
                oModel.getJsonModelAsync(
                    url,
                    function (jsonModel, parent) {
                        var objResponse = jsonModel.getProperty("/results/0");

                        if (objResponse != null) {

                            var totBase = objResponse.AcuerdosDet.results.reduce((a, b) => +a + (+b["Base"] || 0), 0);
                            var totDescto = objResponse.AcuerdosDet.results.reduce((a, b) => +a + (+b["Descuento"] || 0), 0);
                            var totIVA = objResponse.AcuerdosDet.results.reduce((a, b) => +a + (+b["IVA"] || 0), 0);
                            var totalAcuDet = {
                                "TotBase": Number(totBase.toFixed(2)),
                                "TotDescto": Number(totDescto.toFixed(2)),
                                "TotIVA": Number(totIVA.toFixed(2))
                            };
                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(totalAcuDet), 
                                "acuTotDetModel");

                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse),
                                "AcuerdosHdr");

                            parent.paginate("AcuerdosHdr", "/AcuerdosDet", 1, 0);
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
            this.getView().byId("acuerdoInput").setValue("");
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
                        content: "{Centro}"
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
                        content: "{Descuento}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.iva"),
                    template: {
                        content: "{IVA}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.pDesc"),
                    template: {
                        content: "{PDesc}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdos.unidad"),
                    template: {
                        content: "{Unidad}"
                    }
                }
            ];

            this.exportxls('AcuerdosHdr', '/AcuerdosDet/results', columns);
        },

        onListItemPress: function (oEvent) {
            var resource = oEvent.getSource().getBindingContext("AcuerdosHdr").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("AcuerdosHdr");
            var results = odata.getProperty("/AcuerdosDet/Paginated/results");

            var docResult = results[line];

            var sociedad = this.getView().byId("sociedadInput").getValue();
            var documento = this.getView().byId("documentoInput").getValue();
            var ejercicio = this.getView().byId("ejercicioInput").getValue();

            this.getOwnerComponent().getRouter().navTo("detailCargoNS",
                {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    sociedad: sociedad,
                    documento: documento,
                    ejercicio: ejercicio,
                    tienda: docResult.Centro

                }, true);

        },

        onPressPDF: function () {
            var oModel = this.getOwnerComponent().getModel("AcuerdosHdr");
            var oData = oModel.getData();
            var sServiceURL = "/sap/opu/odata/sap/ZOSP_ACUERDOS_SRV/";
			var sSource = sServiceURL + "AcuerdosFilesSet('" + oData.UUID + "')/$value";

			this._pdfViewer.setSource(sSource);
			this._pdfViewer.setTitle("CFDI");
			this._pdfViewer.open();
        },

        onPressXML: function () {
            var oModel = this.getOwnerComponent().getModel("AcuerdosHdr");
            var oData = oModel.getData();
            var sServiceURL = "/sap/opu/odata/sap/ZOSP_ACUERDOS_SRV/";
            var oModel =  new sap.ui.model.odata.ODataModel(sServiceURL);

            oModel.read("/AcuerdosFilesSet('XML"+oData.UUID+"')/$value",{
                method: "GET",
                success: function(data,response) {
             
                    let fName = oData.UUID
                    let fType = "application/xml";
                    let fContent = response.body;

                    sap.ui.core.util.File.save(fContent, fName, "xml", fType);
                },
                error: function(e) {
                    MessageBox.error(e.message);
                } 
            });
        }

    });
});