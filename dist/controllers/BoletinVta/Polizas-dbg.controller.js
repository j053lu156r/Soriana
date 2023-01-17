
    sap.ui.define([
        "demo/controllers/BaseController",
        "sap/m/MessageBox",
        "sap/m/PDFViewer",
        "sap/ui/core/routing/History",
	    "sap/ui/core/routing/Router",
    ], function (Controller, MessageBox, PDFViewer, History, Router) {
        "use strict";
    
        var oModel = new this.Polizas();
        return Controller.extend("demo.controllers.BoletinVta.Polizas", {
            onInit: function () {
                this._pdfViewer = new PDFViewer();
                this.getView().addDependent(this._pdfViewer);

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oModel = this.getOwnerComponent().getModel();
    
                this.getView().addEventDelegate({
                    onAfterShow: function (oEvent) {
                        var barModel = this.getOwnerComponent().getModel();
                        barModel.setProperty("/barVisible", true);
                        this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "PolizasHdr");
                        this.clearFilters();
                    }
                }, this);
                this.configFilterLanguage(this.getView().byId("filterBar"));
            },

            searchData: function () {
                var texts = this.getOwnerComponent().getModel("appTxts");
                var textindSoc = texts.getProperty("/polizas.indSoc");
                var textindEje = texts.getProperty("/polizas.indEje");
                var bContinue = true;
    
                if (!oModel.getModel()) {
                    oModel.initModel();
                }
    
                var sociedad = this.getView().byId('sociedadInput').getValue();
                var documento = this.getView().byId('documentoInput').getValue();
                var ejercicio = this.getView().byId('ejercicioInput').getValue();
        
                if ( documento == "" || documento == null ) {
                    MessageBox.error(texts.getProperty("/polizas.indNo"));
                    bContinue = false;
                } else if ( documento != "" && documento != null ) {
                    if ( sociedad == "" || sociedad == null ){
                        MessageBox.error(textindSoc);
                        bContinue = false;
                    } else if ( ejercicio == "" || ejercicio == null ) {
                        MessageBox.error(textindEje);
                        bContinue = false;
                    }
                }
    
                if (bContinue) {
    
                    var url = "finalcialDocumentsSet?$filter=Bukrs eq '" + sociedad + "' and Belnr eq '" + documento +
                              "' and Gjahr eq '" + ejercicio + "'";
    
                    this.getView().byId('tablePolizas').setBusy(true);
                    oModel.getJsonModelAsync(
                        url,
                        function (jsonModel, parent) {
                            var objResponse = jsonModel.getProperty("/results");
    
                            if (objResponse != null) {
                                if (objResponse.length > 0) {
                                    var vendorName = objResponse[0].Name;
                                    var Agreement = objResponse[0].Knuma;
                                    var totBase = objResponse.reduce((a, b) => +a + (+b["Dmbtr"] || 0), 0);
                                    var totDescto = objResponse.reduce((a, b) => +a + (+b["Wrbtr"] || 0), 0);
                                    var totIVA = objResponse.reduce((a, b) => +a + (+b["Wmwst"] || 0), 0);
                                    var totalAcuDet = {
                                        "TotBase": Number(totBase.toFixed(2)),
                                        "TotDescto": Number(totDescto.toFixed(2)),
                                        "TotIVA": Number(totIVA.toFixed(2)),
                                        "VendorName": vendorName,
                                        "Agreement": Agreement
                                    };
                                    parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(totalAcuDet), 
                                        "acuTotDetModel");
        
                                    parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse),
                                        "PolizasHdr");
        
                                    parent.paginate("PolizasHdr", "/PolizasDet", 1, 0);
                                }
                            }
                            parent.getView().byId('tablePolizas').setBusy(false);
                        },
                        function (parent) {
                            parent.getView().byId('tablePolizas').setBusy(false);
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
                var oModel = this.getOwnerComponent().getModel("PolizasHdr");
                if (oModel) {
                    oModel.setData([]);
                }
            },

            onDebitDetail: function () {

                var documento = this.getView().byId('documentoInput').getValue();
                var ejercicio = this.getView().byId('ejercicioInput').getValue();

                var odata = this.getOwnerComponent().getModel("PolizasHdr");
                var results = odata.getProperty("/");
                var docResult = results[0]; 
                
                this.getOwnerComponent().getRouter().navTo("detailCargoBoletinVta",
                    {
                        layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                        Company: docResult.Bukrs,
                        Agreement: docResult.Knuma,
                        Vendor : docResult.Lifnr,
                        DateCreated: docResult.Erdat,
                        document: documento,
                        year: ejercicio,

                    }, true);

            },
    
            buildExportTable: function () {            
    
                var texts = this.getOwnerComponent().getModel("appTxts");
                var columns = [
                     {
                        name: texts.getProperty("/Polizas.sucursal"),
                        template: {
                            content: "{Centro}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.base"),
                        template: {
                            content: "{Base}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.desc"),
                        template: {
                            content: "{Descuento}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.iva"),
                        template: {
                            content: "{IVA}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.pDesc"),
                        template: {
                            content: "{PDesc}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.unidad"),
                        template: {
                            content: "{Unidad}"
                        }
                    }
                ];
    
                this.exportxls('PolizasHdr', '/', columns);
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

            onClose: function (){
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("", true);
                }
            }
    
        });
    });
