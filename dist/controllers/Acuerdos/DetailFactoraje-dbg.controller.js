sap.ui.define([
    "demo/controllers/BaseController",
    "sap/m/MessageBox",
    "sap/m/PDFViewer"
], function (Controller, MessageBox, PDFViewer) {
    "use strict";

    var oModel = new this.Acuerdos();
    return Controller.extend("demo.controllers.Acuerdos.DetailFactoraje", {
        onInit: function () {
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);
         /*
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getOwnerComponent().getModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "AcuerdosHdr");
                  //  this.clearFilters();
                }
            }, this);
            */
          //  this.configFilterLanguage(this.getView().byId("filterBar"));

            this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("detailAcuerdosFactoraje").attachPatternMatched(this._onDocumentMatched, this);


            console.log('on detalle acuerdos init-----')

        },
        searchData: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var bContinue = true;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

          //  var sociedad = this.getView().byId('sociedadInput').getValue();
           // var documento = this.getView().byId('documentoInput').getValue();
          //  var ejercicio = this.getView().byId('ejercicioInput').getValue();
           // var acuerdo = this.getView().byId('acuerdoInput').getValue();

            var sociedad = this._sociedad;
            var documento = this._document;
            var ejercicio = this._ejercicio;
            var acuerdo = ""





            if ( ( documento == "" || documento == null ) && ( acuerdo == "" || acuerdo == null ) ) {
                MessageBox.error(texts.getProperty("/acuerdos.indNo"));
                bContinue = false;
            } else if ( documento != "" && documento != null ) {
                if ( sociedad == "" || sociedad == null ){
                    MessageBox.error(texts.getProperty("/acuerdos.indSoc"));
                    bContinue = false;
                } else if ( ejercicio == "" || ejercicio == null ) {
                    MessageBox.error(texts.getProperty("/acuerdos.indEje"));
                    bContinue = false;
                }
            } else if ( ( documento != "" && documento != null ) && ( acuerdo != "" && acuerdo != null ) ) {
                MessageBox.error(texts.getProperty("/acuerdos.soloIndNo"));
                bContinue = false;
            }

            if (bContinue) {

                var url = "AcuerdosSet?$expand=AcuerdosDet&$filter=";

                if (documento != "" && documento != null) {
                    url += "Sociedad eq '" + sociedad + "'";
                    url += " and Documento eq '" + documento + "'";
                    url += " and Ejercicio eq '" + ejercicio + "'";
                } else if (acuerdo != "" && acuerdo != null) {
                    url += "Acuerdo eq '" + acuerdo + "'";
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
            this.getView().byId("sociedadInput").setValue("");
            this.getView().byId("documentoInput").setValue("");
            this.getView().byId("ejercicioInput").setValue("");
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

        _onDocumentMatched: function (oEvent) {
            console.log("on Acuerdos AS matched**************")
			this._document = oEvent.getParameter("arguments").document || this._document || "0";
			this._sociedad = oEvent.getParameter("arguments").sociedad || this._sociedad || "0";
			this._ejercicio = oEvent.getParameter("arguments").ejercicio || this._ejercicio || "0";
            this._doc = oEvent.getParameter("arguments").doc || this._doc || "0";
            this._fecha = oEvent.getParameter("arguments").fecha || this._fecha || "0";



			//this.getView().bindElement({
		//		path: "/ProductCollection/" + this._document,
		//		model: "products"
		//	});

		//	this.getView().setModel(new JSONModel({
		//			"document": this._document
		//		}),
		//		"detailAcuerdosAS");


				//consume el servicio para obtener los docuemntos

				 this.searchData()



		},


        //HANDLE WINDOW EVENTS

		handleFullScreen: function () {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2);
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detailAcuerdosFactoraje", {
				layout: sNextLayout,
				document: this._document,
				sociedad: this._sociedad,
				ejercicio: this._ejercicio,
                doc: this._document,
 			});
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detailAcuerdosFactoraje", {
				layout: sNextLayout,
				document: this._document,
				sociedad: this._sociedad,
				ejercicio: this._ejercicio,
                doc: this._document
 			});
		},
		handleClose: function () {
			console.log('on hanlde close')
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("detailFactoring",
                {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    document: this._doc,
                    sociedad: this._sociedad,
                    ejercicio:  this._ejercicio,
                    fecha: this._fecha
                    // lifnr: docResult.Lifnr
                }, true);
		},

        onListItemPress: function (oEvent) {
            var resource = oEvent.getSource().getBindingContext("AcuerdosHdr").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("AcuerdosHdr");
            var results = odata.getProperty("/AcuerdosDet/Paginated/results");
            var docResult = results[line];

            var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(3);
            this.getOwnerComponent().getRouter().navTo("detailDetailAcuFA",
                {
                    layout: oNextUIState.layout,
                    sociedad: this._sociedad,
                    document: this._document,
				    ejercicio: this._ejercicio,
                    doc: this._doc,
                    tda: docResult.Centro

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