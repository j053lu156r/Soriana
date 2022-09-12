sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
    "sap/m/PDFViewer",
    "sap/m/MessageBox"
], function (JSONModel, Controller, PDFViewer, MessageBox) {
    "use strict";

    var oModel = new this.Aportaciones();
    return Controller.extend("demo.controllers.Aportaciones.DetailDetailAS", {
        onInit: function () {
            this._pdfViewer = new PDFViewer();
			this.getView().addDependent(this._pdfViewer);
            
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailAportacionesAS").attachPatternMatched(this._onDocumentMatched, this);
            this.oRouter.getRoute("detailAportacionesComplemento").attachPatternMatched(this._onDocumentMatchedComplemento, this);
            this.oRouter.getRoute("detailAportacionesFactoraje").attachPatternMatched(this._onDocumentMatchedFactoraje, this);

            [oExitButton, oEnterButton].forEach(function (oButton) {
                oButton.addEventDelegate({
                    onAfterRendering: function () {
                        if (this.bFocusFullScreenButton) {
                            this.bFocusFullScreenButton = false;
                            oButton.focus();
                        }
                    }.bind(this)
                });
            }, this);
        },
        handleItemPress: function (oEvent) {
            /*var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
            	supplierPath = oEvent.getSource().getBindingContext("tableItemsCompl").getPath(),
            	supplier = supplierPath.split("/").slice(-1).pop();*/

        },
        //pantalla completa
        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
            var sNextLayoutB = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");

            if (this._vistaAnteior == "COMPLEMENTOS") {

                this.oRouter.navTo("detailAportacionesComplemento", {
                    layout: sNextLayout,
                    document: this._folio
                });


            } else if(this._vistaAnteior == "FACTORAJE"){

                this.oRouter.navTo("detailAportacionesFactoraje", {
                    layout: sNextLayout,
                    document: this._folio
                });


            } else {

                this.oRouter.navTo("detailAportacionesAS", {
                    layout: sNextLayoutB,
                    folio: this._folio,
                    view: this._view
                });


            }
        },

        //vista normal
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
            var route = ""
            if (this._vistaAnteior == "COMPLEMENTOS") {

                this.oRouter.navTo("detailAportacionesComplemento", {
                    layout: sNextLayout,
                    document: this._folio
                });


            } else  if (this._vistaAnteior == "Factoraje") {

                this.oRouter.navTo("detailAportacionesFactoraje", {
                    layout: sNextLayout,
                    document: this._folio
                });


            } else {

                this.oRouter.navTo("detailAportacionesAS", {
                    layout: this._layout,
                    folio: this._folio,
                    view: this._view
                });


            }


        },


        handleClose: function () {
            // var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");



            if (this._vistaAnteior == "COMPLEMENTOS") {
                this.oRouter.navTo("detailComplPagos", {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    document: this._doc,
                    sociedad: this._sociedad,
                    ejercicio: this._ejercicio,
                    fecha: this._fecha

                });

            }  else  if (this._vistaAnteior == "FACTORAJE") {
                this.oRouter.navTo("detailFactoring", {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    document: this._doc,
                    sociedad: this._sociedad,
                    ejercicio: this._ejercicio,
                    fecha: this._fecha

                });

            }  else {

                this.oRouter.navTo("EstadoCuenta", {
                    //layout: sNextLayout
                });

            }
        },
        _onDocumentMatched: function (oEvent) {
            this._vistaAnteior = "ESTADO_CUENTA"
            this._folio = oEvent.getParameter("arguments").document || this._folio || "0";
            this._layout = oEvent.getParameter("arguments").layout || this._layout || "0";
            this._view = oEvent.getParameter("arguments").view || this._view || "0";


            var url = "AportaSet?$expand=AportaDet&$filter=IOption eq '1'";;
            if (this._folio != "" && this._folio != null) {
                url += " and IFolio eq '" + this._folio + "'";
            }

            //this.getView().byId('ObjectPageLayout').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results/0");

                    if (objResponse != null) {
                        parent.getOwnerComponent().setModel(new JSONModel(objResponse.AportaDet.results[0]),
                            "AportaDetDet");
                    }
                    //parent.getView().byId('ObjectPageLayout').setBusy(false);
                },
                function (parent) {
                    //parent.getView().byId('ObjectPageLayout').setBusy(false);
                },
                this
            );
        },
        _onDocumentMatchedComplemento: function (oEvent) {
            var that=this;
            this._vistaAnteior = "COMPLEMENTOS"

            this._folio = oEvent.getParameter("arguments").document || this._folio || "0";
            this._layout = oEvent.getParameter("arguments").layout || this._layout || "0";
            this._view = oEvent.getParameter("arguments").view || this._view || "0";
            this._sociedad = oEvent.getParameter("arguments").sociedad || this._sociedad || "0";
            this._fecha = oEvent.getParameter("arguments").fecha || this._fecha || "0";
            this._ejercicio=oEvent.getParameter("arguments").ejercicio || this._ejercicio|| "0";

            this._doc=oEvent.getParameter("arguments").doc || this._doc|| "0";



         /*   var url = "AportaSet?$expand=AportaDet&$filter=IOption eq '1'";
            if (this._folio != "" && this._folio != null) {
                url += " and IFolio eq '" + this._folio + "'";
            }

            //this.getView().byId('ObjectPageLayout').setBusy(true);
            oModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results/0");

                    if (objResponse.EError === 'X') {
                        sap.m.MessageBox.error(objResponse.EDescripEvent, {

                            onClose: function (sAction) {
                                this.handleClose();
                            }
                        });
                    }else{
                        if (objResponse != null) {
                            parent.getOwnerComponent().setModel(new JSONModel(objResponse.AportaDet.results[0]),
                                "AportaDetDet");
                        }
                    }

                    //parent.getView().byId('ObjectPageLayout').setBusy(false);
                },
                function (parent) {
                    //parent.getView().byId('ObjectPageLayout').setBusy(false);
                },
                this
            );*/

            var auxFilters = [];
            auxFilters.push(new sap.ui.model.Filter({
                path: "IOption",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: '1'
            })
            );
            if (this._folio != "" && this._folio != null) {
                //  url += " and IFolio eq '" + this._folio + "'";
                auxFilters.push(new sap.ui.model.Filter({
                    path: "IFolio",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: this._folio
                })
                );
            }

            var model = "ZOSP_APORTA_SRV";
            var entity = "AportaSet";
            var expand = "AportaDet";
            var filter = auxFilters;
            var select = "";
            sap.ui.core.BusyIndicator.show();
            that._GEToDataV2(model, entity, filter, expand).then(function (_GEToDataV2Response) {
                sap.ui.core.BusyIndicator.hide();
                var objResponse = _GEToDataV2Response.data.results[0];
console.log(objResponse);
                if (objResponse.EError === 'X') {
                    sap.m.MessageBox.error(objResponse.EDescripEvent, {

                        onClose: function (sAction) {
                            that.handleClose();
                        }
                    });

                }
                if (objResponse != null) {
                   /* parent.getOwnerComponent().setModel(new JSONModel(objResponse.AportaDet.results[0]),
                        "AportaDetDet");*/
                        var auxJsonModel = new sap.ui.model.json.JSONModel(objResponse.AportaDet.results[0]);
                        that.getView().setModel(auxJsonModel, 'AportaDetDet');
                }


            });
        },
        _onDocumentMatchedFactoraje: function (oEvent) {
            var that=this;
            this._vistaAnteior = "FACTORAJE"

            this._folio = oEvent.getParameter("arguments").document || this._folio || "0";
            this._layout = oEvent.getParameter("arguments").layout || this._layout || "0";
            this._view = oEvent.getParameter("arguments").view || this._view || "0";
            this._sociedad = oEvent.getParameter("arguments").sociedad || this._sociedad || "0";
            this._fecha = oEvent.getParameter("arguments").fecha || this._fecha || "0";
            this._ejercicio=oEvent.getParameter("arguments").ejercicio || this._ejercicio|| "0";

            this._doc=oEvent.getParameter("arguments").doc || this._doc|| "0";



            var auxFilters = [];
            auxFilters.push(new sap.ui.model.Filter({
                    path: "IOption",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: '1'
                })
            );
            if (this._folio != "" && this._folio != null) {
                //  url += " and IFolio eq '" + this._folio + "'";
                auxFilters.push(new sap.ui.model.Filter({
                        path: "IFolio",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: this._folio
                    })
                );
            }

            var model = "ZOSP_APORTA_SRV";
            var entity = "AportaSet";
            var expand = "AportaDet";
            var filter = auxFilters;
            var select = "";
            sap.ui.core.BusyIndicator.show();
            that._GEToDataV2(model, entity, filter, expand).then(function (_GEToDataV2Response) {
                sap.ui.core.BusyIndicator.hide();
                var objResponse = _GEToDataV2Response.data.results[0];
                console.log(objResponse);
                if (objResponse.EError === 'X') {
                    sap.m.MessageBox.error(objResponse.EDescripEvent, {

                        onClose: function (sAction) {
                            that.handleClose();
                        }
                    });

                }
                if (objResponse != null) {
                    /* parent.getOwnerComponent().setModel(new JSONModel(objResponse.AportaDet.results[0]),
                         "AportaDetDet");*/
                    var auxJsonModel = new sap.ui.model.json.JSONModel(objResponse.AportaDet.results[0]);
                    that.getView().setModel(auxJsonModel, 'AportaDetDet');
                }


            });
        },

        onPressPDF: function () {
            var oModel = this.getOwnerComponent().getModel("AportaDetDet");
            var oData = oModel.getData();
            var sServiceURL = "/sap/opu/odata/sap/ZOSP_APORTA_SRV/";
			var sSource = sServiceURL + "AportaFilesSet('" + oData.Uuid + "')/$value";

			this._pdfViewer.setSource(sSource);
			this._pdfViewer.setTitle("CFDI");
			this._pdfViewer.open();
        },

        onPressXML: function () {
            var oModel = this.getOwnerComponent().getModel("AportaDetDet");
            var oData = oModel.getData();
            var sServiceURL = "/sap/opu/odata/sap/ZOSP_APORTA_SRV/";
            var oModel =  new sap.ui.model.odata.ODataModel(sServiceURL);

            oModel.read("/AportaFilesSet('XML"+oData.Uuid+"')/$value",{
                method: "GET",
                success: function(data,response) {
             
                    let fName = oData.Uuid
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
