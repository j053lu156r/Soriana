
    sap.ui.define([
        "demo/controllers/BaseController",
        "sap/m/MessageBox",
        "sap/m/PDFViewer",
        "sap/ui/core/routing/History",
	    "sap/ui/core/routing/Router",
    ], function (Controller, MessageBox, PDFViewer, History, Router) {
        "use strict";
    
        var oModel = new this.Polizas();
        return Controller.extend("demo.controllers.BoletinVta.DetailPolizas", {
            onInit: function () {
                this._pdfViewer = new PDFViewer();
                this.getView().addDependent(this._pdfViewer);

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oModel = this.getOwnerComponent().getModel();
    
                this.oRouter.getRoute("BoletinVtaDetailPolizas").attachPatternMatched(this._onDocumentMatched, this);

                this.getView().addEventDelegate({
                    onAfterShow: function (oEvent) {
                        var barModel = this.getOwnerComponent().getModel();
                        barModel.setProperty("/barVisible", true);
                        this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "PolizasHdr");
                        //this.clearFilters();
                    }
                }, this);
                this.configFilterLanguage(this.getView().byId("filterBar"));
            },

            handleFullScreen: function () {
                //var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2);
                this.bFocusFullScreenButton = true;
                var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
                this.oRouter.navTo("BoletinVtaDetailPolizas", 
                    {
                        layout: sNextLayout,
                        company: this._company,
                        document: this._document,
                        year: this._year
                    }
                );
            },

            handleExitFullScreen: function () {
                this.bFocusFullScreenButton = true;
                var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
                this.oRouter.navTo("BoletinVtaDetailPolizas", 
                    {
                        layout: sNextLayout,
                        company: this._company,
                        document: this._document,
                        year: this._year
                    }
                );
            },

            handleClose: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("", true);
                }
            },

            _onDocumentMatched: function (oEvent) {
			
                this._company = oEvent.getParameter("arguments").company || this._company || "0";
                this._document = oEvent.getParameter("arguments").document || this._document || "0";
                this._year = oEvent.getParameter("arguments").year || this._year || "0";

                var headerDeatil = {
                    "company": this._company,
                    "document": this._document,
                    "year": this._year
                };
    
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(headerDeatil), "policieDetModel");

                this.searchData();
    
            },

            searchData: function () {
                var texts = this.getOwnerComponent().getModel("appTxts");
                var bContinue = true;
    
                if (!oModel.getModel()) {
                    oModel.initModel();
                }
      
                var url = "finalcialDocumentsSet?$filter=Bukrs eq '" + this._company + "' and Belnr eq '" + this._document + "' and Gjahr eq '" + this._year + "'";

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
    
            },
            onExit: function () {
    
            },

            onDebitDetail: function () {

                //var odata = this.getOwnerComponent().getModel("acuTotDetModel");
                //var results = odata.getProperty("/");

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
    
                this.exportxls('PolizasHdr', '/PolizasDet/results', columns);
            },
    
        });
    });
