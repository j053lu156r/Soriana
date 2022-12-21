sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
    "sap/m/PDFViewer",
    "sap/m/MessageBox"
], function (JSONModel, Controller, PDFViewer, MessageBox) {
    "use strict";

    var oModel = new this.Aportaciones();
    return Controller.extend("demo.controllers.Aportaciones.DetailDetail", {
        onInit: function () {
            this._pdfViewer = new PDFViewer();
			this.getView().addDependent(this._pdfViewer);
            
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailDetailAporta").attachPatternMatched(this._onDocumentMatched, this);

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
        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
            this.oRouter.navTo("detailDetailAporta",
                {
                    layout: sNextLayout,
                    folio: this._folio, 
                    concepto: this._concepto,
                    gerencia: this._gerencia,
                    importe: this._importe
                }
            );
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
            this.oRouter.navTo("detailDetailAporta",
                {
                    layout: sNextLayout,
                    folio: this._folio, 
                    concepto: this._concepto,
                    gerencia: this._gerencia,
                    importe: this._importe
                }
            );
        },
        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");
            this.oRouter.navTo("detailAportaciones", 
                { 
                    layout: sNextLayout,
                    folio: this._folio, 
                    concepto: this._concepto,
                    gerencia: this._gerencia,
                    importe: this._importe
                }
            );
        },
        _onDocumentMatched: function (oEvent) {
            this._folio = oEvent.getParameter("arguments").folio || this._folio || "0";
            this._concepto = oEvent.getParameter("arguments").concepto || this.concepto || "0";
            this._gerencia = oEvent.getParameter("arguments").gerencia || this.gerencia || "0";
            this._importe = oEvent.getParameter("arguments").importe || this.importe || "0";

            var url = "AportaSet?$expand=AportaDet&$filter=IOption eq '1'";
            ;
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
