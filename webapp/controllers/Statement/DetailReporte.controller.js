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

    var oModel = new this.MejorCond();

    return Controller.extend("demo.controllers.Statement.DetailReporte", {
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

            this.oRouter.getRoute("EstadoCuentaReporte").attachPatternMatched(this._onDocumentMatched, this);


            console.log('on reporte estado cuenta init-----')

        },
        searchData: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var bContinue = true;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "ddMMYY"
            });

            //  var sociedad = this.getView().byId('sociedadInput').getValue();
            // var documento = this.getView().byId('documentoInput').getValue();
            //  var ejercicio = this.getView().byId('ejercicioInput').getValue();
            // var acuerdo = this.getView().byId('acuerdoInput').getValue();

            var date = new Date(this._date)
            var proveedor = this._proveedor;
            var documento = this._document;
            var serie = this._serie;
            var fecha =  dateFormat.format(date) ///this._fecha.replace(/-/g, '');;




            if (bContinue) {

                var url = "RepMejorCondSet?$filter=";

                if (documento != "" && documento != null) {

                    url += "IAcre eq '" + proveedor + "'";
                    url += " and IFolio eq '" + documento + "'";
                    url += " and ISerie eq '" + serie + "'";
                    url += " and IFe eq '" + fecha + "'";
                }
                //  /sap/opu/odata/sap/ZOSP_MEJOR_COND_REP_SRV/
                var dueModel = oModel.getJsonModel(url);
                var ojbResponse = dueModel.getProperty("/results/0");

                console.log(ojbResponse)
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(ojbResponse),
                    "AcuerdosHdr");
                this.paginate("AcuerdosHdr", "/AcuerdosDet", 1, 0);
            }

        },
        onExit: function () {

        },

        clearFilters: function () {
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
            var columns = [{
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
            this._document = oEvent.getParameter("arguments").document || this._document || "0";
            this._proveedor = oEvent.getParameter("arguments").proveedor || this._proveedor || "0";
            this._serie = oEvent.getParameter("arguments").serie || this._serie || "0";
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
            this.oRouter.navTo("EstadoCuentaReporte", {
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
            this.oRouter.navTo("EstadoCuentaReporte", {
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
            this.oRouter.navTo("EstadoCuenta", {});
        },


        formatDate: function (d) {
            //get the month
            var month = d.getMonth();
            //get the day
            //convert day to string
            var day = d.getDate().toString();
            //get the year
            var year = d.getFullYear();

            //pull the last two digits of the year
            year = year.toString().substr(-2);

            //increment month by 1 since it is 0 indexed
            //converts month to a string
            month = (month + 1).toString();

            //if month is 1-9 pad right with a 0 for two digits
            if (month.length === 1) {
                month = "0" + month;
            }

            //if day is between 1-9 pad right with a 0 for two digits
            if (day.length === 1) {
                day = "0" + day;
            }

            //return the string "MMddyy"
            return  day+month+year;
        }




    });
});