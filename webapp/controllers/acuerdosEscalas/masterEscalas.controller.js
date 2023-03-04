
    sap.ui.define([
        "demo/controllers/BaseController",
        "sap/m/MessageBox",
        "sap/m/PDFViewer",
        "sap/ui/core/routing/History",
	    "sap/ui/core/routing/Router",
    ], function (Controller, MessageBox, PDFViewer, History, Router) {
        "use strict";
    
        var oModel = new this.ACEscalas();
        return Controller.extend("demo.controllers.acuerdosEscalas.masterEscalas", {
            onInit: function () {
                this._pdfViewer = new PDFViewer();
                this.getView().addDependent(this._pdfViewer);

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oModel = this.getOwnerComponent().getModel();
    
                this.getView().addEventDelegate({
                    onAfterShow: function (oEvent) {
                        var barModel = this.getOwnerComponent().getModel();
                        barModel.setProperty("/barVisible", true);
                        this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "EscalasDta");
                        this.clearFilters();
                    }
                }, this);
                this.configFilterLanguage(this.getView().byId("filterBar"));
            },

            searchData: function () {

                var texts = this.getOwnerComponent().getModel("appTxts");
                var textindSoc = texts.getProperty("/ACEscalas.indSoc");
                var textindEje = texts.getProperty("/ACEscalas.indEje");
                var vErrVendor = texts.getProperty("/foliosCap.indVendor");
                var bContinue = true;
    
                if (!oModel.getModel()) {
                    oModel.initModel();
                }
    
                var sociedad = this.getView().byId('sociedadInput').getValue();
                var documento = this.getView().byId('documentoInput').getValue();
                var ejercicio = this.getView().byId('ejercicioInput').getValue();
                var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
                
                if ( vLifnr === "" || vLifnr === null)  {
                    bContinue = false;
                    MessageBox.error(vErrVendor);
                } else if ( documento == "" || documento == null ) {
                    MessageBox.error(texts.getProperty("/ACEscalas.indNo"));
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
    
                    var url = "ScaleSet?$filter=bukrs eq '" + sociedad + "' and mblnr eq '" + documento +
                              "' and mjahr eq '" + ejercicio + "' and lifnr eq '" + vLifnr + "'";
    
                    this.getView().byId('tableEscalas').setBusy(true);
                    oModel.getJsonModelAsync(
                        url,
                        function (jsonModel, parent) {
                            var objResponse = jsonModel.getProperty("/results");
    
                            if (objResponse != null) {
                                if (objResponse.length > 0) {
                                    
                                    var totImporte = objResponse.reduce((a, b) => +a + (+b["dmbtr"] || 0), 0);
                                    var totDescto = objResponse.reduce((a, b) => +a + (+b["zboni"] || 0), 0);
                                    var totIVA = objResponse.reduce((a, b) => +a + (+b["ziva"] || 0), 0);
                                    var totIEPS = objResponse.reduce((a, b) => +a + (+b["zieps"] || 0), 0);
                                    var TotStot = objResponse.reduce((a, b) => +a + (+b["stotal"] || 0), 0);
                                    var currCode = objResponse[0].waers;
                                    var totalAcuDet = {
                                        "totImporte": Number(totImporte.toFixed(2)),
                                        "TotDescto": Number(totDescto.toFixed(2)),
                                        "totIVA": Number(totIVA.toFixed(2)),
                                        "totIEPS": Number(totIEPS.toFixed(2)),
                                        "TotStot": Number(TotStot.toFixed(2)),
                                        "currCode": currCode
                                    };
                                    parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(totalAcuDet), 
                                        "escalaTotModel");
        
                                    parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse),
                                        "EscalasDta");
        
                                    parent.paginate("EscalasDta", "/", 1, 0);
                                }
                            }
                            parent.getView().byId('tableEscalas').setBusy(false);
                        },
                        function (parent) {
                            parent.getView().byId('tableEscalas').setBusy(false);
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
                var oModel = this.getOwnerComponent().getModel("EscalasDta");
                if (oModel) {
                    oModel.setData([]);
                }
            },
    
            buildExportTable: function () {            
    
                var texts = this.getOwnerComponent().getModel("appTxts");
                var columns = [
                     {
                        name: texts.getProperty("/Polizas.sucursal"),
                        template: {
                            content: "{bukrs}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.base"),
                        template: {
                            content: "{mblnr}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.desc"),
                        template: {
                            content: "{mjahr}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.iva"),
                        template: {
                            content: "{lifnr}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.pDesc"),
                        template: {
                            content: "{knuma}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.unidad"),
                        template: {
                            content: "{bwart}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.unidad"),
                        template: {
                            content: "{xblnr}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.unidad"),
                        template: {
                            content: "{werks}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.unidad"),
                        template: {
                            content: "{dmbtr}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.unidad"),
                        template: {
                            content: "{zboni}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.unidad"),
                        template: {
                            content: "{zmgn3}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.unidad"),
                        template: {
                            content: "{meins}"
                        }
                    },
                    {
                        name: texts.getProperty("/Polizas.unidad"),
                        template: {
                            content: "{konwa}"
                        }
                    }

                ];
    
                this.exportxls('EscalasDta', '/', columns);
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
