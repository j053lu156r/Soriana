
sap.ui.define([
    "demo/controllers/BaseController",
    "sap/m/MessageBox",
    "sap/m/PDFViewer",
    "sap/ui/core/routing/History",
    "sap/ui/core/routing/Router",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
], function (Controller, MessageBox, PDFViewer, History, Router,exportLibrary, Spreadsheet) {
    "use strict";
    var EdmType = exportLibrary.EdmType;
    var oModel = new this.ACEscalas();
    return Controller.extend("demo.controllers.ComplPago.DetailCrecimiento", {
        onInit: function () {


            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("DetailCrecimiento").attachPatternMatched(this._onDocumentMatched, this);

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

      var sociedad = this.sociedad;
            var documento = this._document;
            var ejercicio = this.year;
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            
            if ( vLifnr === "" || vLifnr === null || vLifnr==="undefined")  {
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
            console.log(this._document,this.sociedad, this.year)
            if (bContinue) {

                var url = "ScaleSet?$filter=bukrs eq '" + sociedad + "' and belnr eq '" + documento +
                          "' and gjahr eq '" + ejercicio + "' and lifnr eq '" + vLifnr + "'";

                this.getView().byId('tableEscalas2').setBusy(true);
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
                        parent.getView().byId('tableEscalas2').setBusy(false);
                    },
                    function (parent) {
                        parent.getView().byId('tableEscalas2').setBusy(false);
                    },
                    this
                );
            }

        },
       
    

       
       
       

        _onDocumentMatched: function (oEvent) {

console.log(oEvent.getParameter("arguments"))
            this._document = oEvent.getParameter("arguments").document || this._document || "0";
            this.sociedad2 = oEvent.getParameter("arguments").sociedad || this._proveedor || "0";
            this.sociedad = this.sociedad2.split("-")[0];
            this.year= this.sociedad2.split("-")[1];
console.log(this._document,this.sociedad, this.year)

            this.searchData()



        },


        //HANDLE WINDOW EVENTS

        handleFullScreen: function () {
            var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2);
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.getOwnerComponent().getRouter().navTo("AcuerdosEC", {
                layout: sNextLayout,
                document: this._document,
                sociedad: this.sociedad,
      
            }, true);
        
          
         /*   this.oRouter.navTo("EstadoCuenta", {
                layout: sNextLayout,
                document: this._document,
                sociedad: this.sociedad,

            });*/
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.oRouter.navTo("EstadoCuenta", {
                layout: sNextLayout,
                document: this._document,
                sociedad: this.sociedad,

            });
        },
    

        handleClose: function () {
            console.log('on hanlde close')
            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel([]), 
            "escalaTotModel");

            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel([]),
            "EscalasDta");

            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("masterCompl", {layout: sNextLayout});
            // this.onBackPreviousView()
        },


        buildExportTable: function () {




            var aCols, oRowBinding, oSettings, oSheet, oTable, that = this;
          
            if (!that._oTable) {
                that._oTable = this.byId('tableEscalas2');
            }

            oTable = that._oTable;
            console.log(oTable.mBindingInfos.items.binding.oList)
         
            oRowBinding = oTable.mBindingInfos.items.binding.oList;

            aCols = that.createColumnConfig();

            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Acuerdos de Escalas',
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });

        },

        createColumnConfig: function () {
         
      
             var   aCols = [];

            var texts = this.getOwnerComponent().getModel("appTxts");

            

                aCols.push({
                    label: texts.getProperty("/ACEscalas.arrangement"),
                    type: EdmType.String,
                    property: 'knuma'
                });
        

         
            aCols.push({
                label: texts.getProperty("/ACEscalas.matdoc"),
                type: EdmType.String,
                property: 'mblnr'
            });
    
     
            aCols.push({
                label: texts.getProperty("/ACEscalas.matdocYear"),
                type: EdmType.String,
                property: 'mjahr'
            });
     
            aCols.push({
                label: texts.getProperty("/ACEscalas.movClass"),
                type: EdmType.String,
                property: 'bwart'
            });
      
            aCols.push({
                label: texts.getProperty("/ACEscalas.reference"),
                type: EdmType.String,
                property: 'xblnr'
            });
       
            aCols.push({
                label: texts.getProperty("/ACEscalas.plant"),
                type: EdmType.String,
                property: 'werks'
            });
       
            aCols.push({
                label: texts.getProperty("/ACEscalas.amount"),
                type: EdmType.String,
                property: 'dmbtr'
            });
      
            aCols.push({
                label: texts.getProperty("/ACEscalas.perDescount"),
                type: EdmType.String,
                property: 'zboni'
            });
        
            aCols.push({
                label: texts.getProperty("/ACEscalas.Descount"),
                type: EdmType.String,
                property: 'zmgn3'
            });
       
            aCols.push({
                label: texts.getProperty("/ACEscalas.IVA"),
                type: EdmType.String,
                property: 'ziva'
            });
    
            aCols.push({
                label: texts.getProperty("/ACEscalas.IEPS"),
                type: EdmType.String,
                property: 'zieps'
            });
       
      
            aCols.push({
                label: texts.getProperty("/ACEscalas.subtotal"),
                type: EdmType.Number,
                property: 'stotal'
            });
    

            return aCols;
        },








    });
});
