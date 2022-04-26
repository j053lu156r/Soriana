sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
    "sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
    "use strict";

    var oModel = new this.PaymentPlan();
    return Controller.extend("demo.controllers.PaymentPlans.Detail", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailPayPlan").attachPatternMatched(this._onDocumentMatched, this);

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
            var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
                supplierPath = oEvent.getSource().getBindingContext("tableDetailMoves").getPath();

            var objModel = this.getOwnerComponent().getModel("tableDetailMoves").getProperty(supplierPath);


            if (!this._oDialog || this.oDialog === undefined) {
                this._oDialog = sap.ui.xmlfragment("demo.fragments.Exhaustion", this);
            }

            this.getView().addDependent(this._oDialog);

            // toggle compact style
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
            this._oDialog.setModel(new JSONModel(objModel));
            this._oDialog.open();
        },
        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.oRouter.navTo("detailPayPlan",
                { 
                    layout: sNextLayout, 
                    document: this._document, 
                    laufd: this._laufd, 
                    laufi: this._laufi, 
                    zbukr: this._zbukr,
                    lifnr: this._lifnr
                }
            );
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.oRouter.navTo("detailPayPlan",
                { 
                    layout: sNextLayout, 
                    document: this._document, 
                    laufd: this._laufd, 
                    laufi: this._laufi, 
                    zbukr: this._zbukr,
                    lifnr: this._lifnr
                }
            );
        },
        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
            this.oRouter.navTo("masterPayPlan", { layout: sNextLayout });
        },
        _onDocumentMatched: function (oEvent) {
            this._document = oEvent.getParameter("arguments").document || this._document || "0",
                this._laufd = oEvent.getParameter("arguments").laufd || this._laufd || "0",
                this._laufi = oEvent.getParameter("arguments").laufi || this._laufi || "0",
                this._zbukr = oEvent.getParameter("arguments").zbukr || this._zbukr || "0",
                this._lifnr = oEvent.getParameter("arguments").lifnr || this._lifnr || "0";

            this._laufd = this._laufd.replaceAll("-", "");

            var url = "EPPHDRSet?$expand=EDETNAV,EGRPNAV&$filter=IOption eq '1' and Lifnr eq '" + this._lifnr + "'"
                + " and Vblnr eq '" + this._document + "'"
                + " and Laufd eq '" + this._laufd + "'"
                + " and Laufi eq '" + this._laufi + "'"
                + " and Zbukr eq '" + this._zbukr + "'";

            var dueModel = oModel.getJsonModel(url);

            var ojbResponse = dueModel.getProperty("/results/0");
            //console.log(dueModel);

            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                "payPlanDetail");

            this.paginate("payPlanDetail", "/EDETNAV", 1, 0);
        },
        formatSatusOrder: function (status) {
            if (status) {
                return 'Cerrado';
            } else {
                return 'Abierto';
            }
        },
        onCloseDialog: function () {
            if (this._oDialog) {
                this._oDialog.destroy();
                this._oDialog = null;
            }
        },
        onExit: function () {
            this.onCloseDialog();
        },
        buildExcel: function(){
            var texts = this.getOwnerComponent().getModel("appTxts");
            let Encabezado = this.getOwnerComponent().getModel("payPlanDetail");

            var columns = [
                {
                    name: texts.getProperty("/plan.paymentDocUPC"),
                    template: {
                        content: Encabezado.getProperty("/Vblnr")
                    }
                },
                {
                    name: texts.getProperty("/plan.societyUPC"),
                    template: {
                        content: Encabezado.getProperty("/Zbukr")
                    }
                },             
                {
                    name: texts.getProperty("/plan.societyUPC"),
                    template: {
                        content: Encabezado.getProperty("/Butxt")
                    }
                },
                {
                    name: texts.getProperty("/plan.amountUPC"),
                    template: {
                        content: Encabezado.getProperty("/Rwbtr")
                    }
                },
                {
                    name: texts.getProperty("/plan.paymentDateUPC"),
                    template: {
                        content: Encabezado.getProperty("/Valut")
                    }
                },
                {
                    name: texts.getProperty("/global.exerciseUPC"),
                    template: {
                        content: Encabezado.getProperty("/Gjahr")
                    }
                },
                {
                    name: texts.getProperty("/plan.supplierUPC"),
                    template: {
                        content: Encabezado.getProperty("/Lifnr")
                    }
                },
                {
                    name: texts.getProperty("/plan.totalAmountUPC"),
                    template: {
                        content: Encabezado.getProperty("/Tfactura")
                    }
                },
                {
                    name: texts.getProperty("/plan.docCountUPC"),
                    template: {
                        content: Encabezado.getProperty("/Cfactura")
                    }
                },
                {
                    name: texts.getProperty("/plan.documentsUPC"),
                    template: {
                        content: "{Blnr}"
                    }
                },
                {
                    name: texts.getProperty("/plan.descriptionUPC"),
                    template: {
                        content: "{Ltext}"
                    }
                },                
                {
                    name: texts.getProperty("/plan.referenceUPC"),
                    template: {
                        content: "{Xref3}"
                    }
                },
                {
                    name: texts.getProperty("/plan.quantityUPC"),
                    template: {
                        content: "{Wrbtr}"
                    }
                },               
                {
                    name: texts.getProperty("/global.currencyUC"),
                    template: {
                        content: "{Waers}"
                    }
                },             

                {
                    name: texts.getProperty("/plan.invoiceNumUPC"),
                    template: {
                        content: "{Xblnr}"                       
                    }
                },
                {
                    name: texts.getProperty("/plan.dateDocUPC"),
                    template: {
                        content: "{Budat}"
                    }
                }                               
            ];

            this.exportxls('payPlanDetail', '/EDETNAV/results', columns);
        },
        generateFile : function(oEvent){
            

            let posicion = oEvent.getSource().getBindingContext("payPlanDetail").getPath().split("/").pop();
            let results = this.getOwnerComponent().getModel("payPlanDetail").getProperty("/EDETNAV/Paginated/results");
            
            let registro = results[posicion];

            let Laufd = String(registro.Laufd).replace(/-/g,"");

            let url = `EPPHDRSet?$expand=EDTLHDR,ECABCNV,EDETCNV&$filter=IOption eq '2' and 
            Zbukr  eq '${registro.Zbukr}' and  
            Lifnr  eq '${registro.Lifnr}' and 
            Gjahr  eq '${registro.Gjahr}' and 
            Laufd  eq '${Laufd}' and 
            Laufi  eq '${registro.Laufi}' and 
            Belnr  eq '${registro.Blnr}' and 
            Vblnr  eq '${registro.Vblnr}'&$format=json`;


            //let oODataJSONModel = this.getOdata(sUri);

            //let oDataJSONModel = this.getOdataJsonModel( url, oODataJSONModel );
            var dueModel = oModel.getJsonModel(url);
            

			//let dataJSON = oDataJSONModel.getJSON();
            let Datos = dueModel.getProperty('/results');
            
            

            let Encabezado = Datos[0].EDTLHDR.results;
            let Totales = Datos[0].ECABCNV.results;
            let Impuestos = Datos[0].EDETCNV.results;
            /*let FacturasProveedor = Datos.results[0].ETXTFACTPROVNAV.results;
            let FacturasSoriana = Datos.results[0].ETXTFACTSORNAV.results;
            let Descuentos = Datos.results[0].ETXTDISCOUNTNAV.results;
            let Agreement = Datos.results[0].ETXTAGREEMENTNAV.results;*/


            let aArchivo = [];
            
            aArchivo = aArchivo.concat( this.generaRenglonesArchivo(Encabezado) );
            aArchivo = aArchivo.concat( this.generaRenglonesArchivo(Totales) );
            aArchivo = aArchivo.concat( this.generaRenglonesArchivo(Impuestos) );
            
            /*aArchivo = aArchivo.concat( this.generaRenglonesArchivo(FacturasSoriana) )
            aArchivo = aArchivo.concat( this.generaRenglonesArchivo(Descuentos) )
            aArchivo = aArchivo.concat( this.generaRenglonesArchivo(Agreement) )*/

            

            let ContenidoArchivo = aArchivo.join("\n");

            let nombreArchivo = registro.Blnr;//String( registro.Bukrs +"_"+ registro.Gjahr + "_" + registro.Vblnr + " -Comp Pago" );
            
            

            sap.ui.core.util.File.save(ContenidoArchivo, nombreArchivo, "txt", "text/plain", "utf-8", false );
        },
        generaRenglonesArchivo: function( Array ){

            let renglones = [];

            for (let i = 0; i < Array.length; i++) 
                renglones.push( Object.values(Array[i]).slice(1).join('\t') );

            return renglones;
        },
    });
});
