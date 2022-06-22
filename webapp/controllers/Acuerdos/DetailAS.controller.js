sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/Fragment",
    "demo/controllers/BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/core/routing/Router",
    "demo/models/BaseModel",
    'sap/f/library'
], function (jQuery, Fragment, Controller, UploadCollectionParameter, JSONModel, History, fioriLibrary, MessageBox) {
    "use strict";

    var oModel = new this.Acuerdos();
    return Controller.extend("demo.controllers.Acuerdos.DetailAS", {
        onInit: function () {
            /*this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);*/
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

			this.oRouter.getRoute("detailAcuerdosAS").attachPatternMatched(this._onDocumentMatched, this);


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

                var dueModel = oModel.getJsonModel(url);
                var ojbResponse = dueModel.getProperty("/results/0");
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(ojbResponse),
                    "AcuerdosHdr");
                this.paginate("AcuerdosHdr", "/AcuerdosDet", 1, 0);
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
			this.oRouter.navTo("detailAcuerdosAS", {
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
			this.oRouter.navTo("detailAcuerdosAS", {
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
			this.oRouter.navTo("EstadoCuenta", {} );
		},

        


    });
});