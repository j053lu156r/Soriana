
    sap.ui.define([
        "demo/controllers/BaseController",
        "sap/m/MessageBox",
        "sap/m/PDFViewer",
        "sap/ui/core/routing/History",
	    "sap/ui/core/routing/Router",
    ], function (Controller, MessageBox, PDFViewer, History, Router) {
        "use strict";
    
        var oModel = new this.Polizas();
        return Controller.extend("demo.controllers.Statement.DetailPolizasE", {
            onInit: function () {
                this._pdfViewer = new PDFViewer();
                this.getView().addDependent(this._pdfViewer);

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oModel = this.getOwnerComponent().getModel();
    
                this.oRouter.getRoute("BoletinVtaDetailPolizasE").attachPatternMatched(this._onDocumentMatched, this);

                this.getView().addEventDelegate({
                    onAfterShow: function (oEvent) {
                        var barModel = this.getOwnerComponent().getModel();
                        barModel.setProperty("/barVisible", true);
                      //  this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "PolizasHdr");
                        //this.clearFilters();
                    }
                }, this);
                this.configFilterLanguage(this.getView().byId("filterBar"));
            },

            handleFullScreen: function () {
                //var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2);
                this.bFocusFullScreenButton = true;
                var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
                this.oRouter.navTo("BoletinVtaDetailPolizasE", 
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
                this.oRouter.navTo("BoletinVtaDetailPolizasE", 
                    {
                        layout: sNextLayout,
                        company: this._company,
                        document: this._document,
                        year: this._year
                    }
                );
            },

            handleClose: function () {
                console.log("hasda")
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
                console.log("entro1")
			
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
                console.log("buscar")
                var texts = this.getOwnerComponent().getModel("appTxts");
                var bContinue = true;
    
                if (!oModel.getModel()) {
                    oModel.initModel();
                }
      
                var url = "finalcialDocumentsSet?$filter=Bukrs eq '" + this._company + "' and Belnr eq '" + this._document + "' and Gjahr eq '" + this._year + "'";

                this.getView().byId('tablePolizas').setBusy(true);

              var auxFilters=[];
                auxFilters.push(new sap.ui.model.Filter({
                    path: "Bukrs",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: this._company 
                })
                )
                auxFilters.push(new sap.ui.model.Filter({
                    path: "Belnr",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: this._document
                })
                )
                auxFilters.push(new sap.ui.model.Filter({
                    path: "Gjahr",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: this._year
                })
                )
                var that = this;
                var model = "ZOS_FI_DOCUMENTS_SRV";
                var entity = "finalcialDocumentsSet";
                var expand = "";
                var filter = auxFilters;
                var select = "";
                that.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "PolizasHdr");
                sap.ui.core.BusyIndicator.show();
                that._GEToDataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
                    sap.ui.core.BusyIndicator.hide();
    console.log(_GEToDataV2Response);
                    var objResponse = _GEToDataV2Response.data.results;

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
                            that.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(totalAcuDet), 
                                "acuTotDetModel");

                                that.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse),
                                "PolizasHdr");

                                that.paginate("PolizasHdr", "/PolizasDet", 1, 0);
                        }
                    }
                    that.getView().byId('tablePolizas').setBusy(false);
    
                });

            /*  oModel.getJsonModelAsync(
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
                );*/
    
            },
            onExit: function () {
    
            },

            onDebitDetail: function () {
console.log("entro")
                //var odata = this.getOwnerComponent().getModel("acuTotDetModel");
                //var results = odata.getProperty("/");

                var documento = this.getView().byId('documentoInput').getValue();
                var ejercicio = this.getView().byId('ejercicioInput').getValue();

                var odata = this.getOwnerComponent().getModel("PolizasHdr");
                var results = odata.getProperty("/");
                var docResult = results[0]; 
                
                this.getOwnerComponent().getRouter().navTo("detailCargoEBoletinVta",
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
            onDebitDetail2: function () {
                console.log("entro2")
                //var odata = this.getOwnerComponent().getModel("acuTotDetModel");
                //var results = odata.getProperty("/");

              //  var documento = this.getView().byId('documentoInput').getValue();
               // var ejercicio = this.getView().byId('ejercicioInput').getValue();

                var odata = this.getOwnerComponent().getModel("PolizasHdr");
                var results = odata.getProperty("/");
                var docResult = results[0]; 
                console.log(docResult)
                
                this.getOwnerComponent().getRouter().navTo("detailCargoBoletinVta2",
                    {
                        layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                        Company: docResult.Bukrs,
                        Agreement: docResult.Knuma,
                        Vendor : docResult.Lifnr,
                        DateCreated: docResult.Erdat,
                        document: docResult.Belnr,
                        year: docResult.Gjahr,

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
