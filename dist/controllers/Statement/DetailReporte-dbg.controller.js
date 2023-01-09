sap.ui.define([
    "jquery.sap.global",
    "sap/ui/core/Fragment",
    "demo/controllers/BaseController",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/ui/core/routing/Router",
    "demo/models/BaseModel",
    'sap/f/library'
  
], function (jQuery, Fragment, Controller, UploadCollectionParameter, JSONModel, History, fioriLibrary, MessageBox, exportLibrary, Spreadsheet) {
    "use strict";
    var EdmType = exportLibrary.EdmType;
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

            this.oRouter.getRoute("ComplementoReporteMC").attachPatternMatched(this._onDocumentMatched, this);


            console.log('on reporte estado cuenta init-----')

        },
        searchData: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var bContinue = true;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "YYYY"
            });

            //  var sociedad = this.getView().byId('sociedadInput').getValue();
            // var documento = this.getView().byId('documentoInput').getValue();
            //  var ejercicio = this.getView().byId('ejercicioInput').getValue();
            // var acuerdo = this.getView().byId('acuerdoInput').getValue();

            var date = new Date(this._date)
            var proveedor = this.padLeadingZeros(this._proveedor,10) ;
            var documento = this._document;
            var serie = this._serie;
            var fecha = this._fecha.replace(/-/g, '');




            if (bContinue) {

                var url = "RepMejorCondSet?$filter=(";

                if (documento != "" && documento != null) {

                    url += "IAcre eq '" + proveedor + "'";
                    url += " and IFolio eq '" + documento + "'";
                    url += " and ISerie eq '" + serie + "'";
                    url += " and IFe eq '" + fecha + "')";
                }
                //  /sap/opu/odata/sap/ZOSP_MEJOR_COND_REP_SRV/
                var dueModel = oModel.getJsonModel(url);
                var ojbResponse = dueModel.getProperty("/results");

                console.log(ojbResponse)
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(ojbResponse),
                    "MejorCondHdr");
              //  this.paginate("MejorCondHdr", "/", 1, 0);
            }

        },
        onExit: function () {

        },

        clearFilters: function () {
            this.getView().byId("sociedadInput").setValue("");
            this.getView().byId("documentoInput").setValue("");
            this.getView().byId("ejercicioInput").setValue("");
            this.getView().byId("acuerdoInput").setValue("");
            var oModel = this.getOwnerComponent().getModel("MejorCondHdr");
            if (oModel) {
                oModel.setData([]);
            }
        },

        buildExportTable: function () {

         /*   var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [{
                    name: texts.getProperty("/acuerdos.sucursal"),
                    template: {
                        content: "{DocCompra}"
                    }
                }

            ];

            columns = []


            var table = this.byId("tableAcuerdos")

            console.log(table)

            var tableColumns = this.getView().byId("tableAcuerdos").getColumns();

            console.log(tableColumns)

            for (let column of  tableColumns){

               var label = column.mAggregations.label.mProperties.text
               var template = column.mProperties.sortProperty

               console.log(label)
               var content = `{${template}}`

            columns.push({
                name: label,
                template: {
                    content: content
                }
			});

            }


            this.exportxls('MejorCondHdr', '/', columns);
            */
           var aCols, oRowBinding, oSettings, oSheet, oTable, that = this;

           if (!that._oTable) {
               that._oTable = this.byId('tableAcuerdos');
           }

           oTable = that._oTable;

           oRowBinding = oTable.getBinding().oList;

           aCols = that.createColumnConfig();

           oSettings = {
               workbook: {
                   columns: aCols,
                   hierarchyLevel: 'Level'
               },
               dataSource: oRowBinding,
               fileName: 'Estado de Cuenta',
               worker: false // We need to disable worker because we are using a MockServer as OData Service
           };

           oSheet = new Spreadsheet(oSettings);
           oSheet.build().finally(function () {
               oSheet.destroy();
           });

        },

        genereteRowAction: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");

            var oTable = this.byId("tableVisor");

            var oTemplate = oTable.getRowActionTemplate();
            if (oTemplate) {
                oTemplate.destroy();
                oTemplate = null;
            }



            oTemplate = new RowAction({
                items: [
                    new RowActionItem({ icon: "sap-icon://open-command-field", text: texts.getProperty("/global.view"), press: (Event) => this.onPress(Event) }),

                ]
            });


            oTable.setRowActionTemplate(oTemplate);
            oTable.setRowActionCount(2);
        },

        createColumnConfig: function () {
            var that = this;
            var oModel = that.getView().getModel("MejorCondHdr").getData(),
                aCols = [];

            var texts = this.getOwnerComponent().getModel("appTxts");
           
             //A
             aCols.push({
                label: texts.getProperty("/reporte.headerOrden"),
                type: EdmType.String,
                property: 'TeSalida/DocCompra'
            });
            //B
            aCols.push({
                label: texts.getProperty("/reporte.headerPosicion"),
                type: EdmType.String,
                property: 'TeSalida/Posicion'
            });
            //C
            aCols.push({
                label: texts.getProperty("/reporte.headerNE"),
                type: EdmType.String,
                property: 'TeSalida/FolionEntrada'
            });
            //D
            aCols.push({
                label: texts.getProperty("/reporte.headerEntradaMercancia"),
                type: EdmType.String,
                property: 'TeSalida/DocMaterial'
            });
            //E
            aCols.push({
                label: texts.getProperty("/reporte.headerRegFactura"),
                type: EdmType.String,
                property: 'TeSalida/DocFactura'
            });
            //F
            aCols.push({
                label: texts.getProperty("/reporte.folioCargo"),
                type: EdmType.String,
                property: 'TeSalida/DocCargo'
            });
            //G
            aCols.push({
                label: texts.getProperty("/reporte.refInterna"),
                type: EdmType.String,
                property: 'TeSalida/Cmsucfol'
            });
            //H
            aCols.push({
                label: texts.getProperty("/reporte.EAN"),
                type: EdmType.String,
                property: 'TeSalida/EanUpc'
            });
            //I
            aCols.push({
                label: texts.getProperty("/reporte.mterialRecibo"),
                type: EdmType.String,
                property: 'TeSalida/MaterialSap'
            });
            //J
            aCols.push({
                label: texts.getProperty("/reporte.fechaRecibo"),
                type: EdmType.String,
                property: 'TeSalida/FecharSap'
            });
            //K
            aCols.push({
                label: texts.getProperty("/reporte.unidadRecibo"),
                type: EdmType.String,
                property: 'TeSalida/UmedidaPSap'
            });
            //L
            aCols.push({
                label: texts.getProperty("/reporte.cantidadRecibo"),
                type: EdmType.Number,
                property: 'TeSalida/CantidadSap'
            });
            //M
            aCols.push({
                label: texts.getProperty("/reporte.costoRecibo"),
                type: EdmType.Number,
                property: 'TeSalida/PrecCDescSap'
            });
            //N
            aCols.push({
                label: texts.getProperty("/reporte.subtotalRecibo"),
                type: EdmType.Number,
                property: 'TeSalida/ImporteSap'
            });
            //O
            aCols.push({
                label: texts.getProperty("/reporte.impuestosRecibo"),
                type: EdmType.Number,
                property: 'TeSalida/ImpuestosSap'
            });
            //P
            aCols.push({
                label: texts.getProperty("/reporte.totalRecibo"),
                type: EdmType.Number,
                property: 'TeSalida/ImpTotCImpSap'
            });
            //Q
            aCols.push({
                label: texts.getProperty("/reporte.recepcionCFDI"),
                type: EdmType.String,
                property: 'TeSalida/FechaRegSap'
            });
            //R
            aCols.push({
                label: texts.getProperty("/reporte.factura"),
                type: EdmType.String,
                property: 'TeSalida/Serfol'
            });
            //S
            aCols.push({
                label: texts.getProperty("/reporte.materialCFDI"),
                type: EdmType.String,
                property: 'TeSalida/Material'
            });
            //T

            aCols.push({
                label: texts.getProperty("/reporte.unidadMedida"),
                type: EdmType.String,
                property: 'TeSalida/Unidad'
            });
            //U
            aCols.push({
                label: texts.getProperty("/reporte.cantidadCFDI"),
                type: EdmType.Number,
                property: 'TeSalida/Cantidad'
            });
            //V
            aCols.push({
                label: texts.getProperty("/reporte.costoCFDI"),
                type: EdmType.Number,
                property: 'TeSalida/PrecioUnSi'
            });
            //W
            aCols.push({
                label: texts.getProperty("/reporte.subtotalCFDI"),
                type: EdmType.Number,
                property: 'TeSalida/ImporteTotal'
            });
            //X
            aCols.push({
                label: texts.getProperty("/reporte.impuestosCFDI"),
                type: EdmType.Number,
                property: 'TeSalida/ImpuestosFact'
            });
            //Y
            aCols.push({
                label: texts.getProperty("/reporte.totalCFDI"),
                type: EdmType.Number,
                property: 'TeSalida/ImporteTotCi'
            });
            //Z
            aCols.push({
                label: texts.getProperty("/reporte.cantidadMC"),
                type: EdmType.Number,
                property: 'TeSalida/MejorCantidad'
            });
            //AA
            aCols.push({
                label: texts.getProperty("/reporte.costoMC"),
                type: EdmType.Number,
                property: 'TeSalida/MejorPrecio'
            });
            //BB
            aCols.push({
                label: texts.getProperty("/reporte.subtotalMC"),
                type: EdmType.Number,
                property: 'TeSalida/MejorSubtotal'
            });
            //CC
            aCols.push({
                label: texts.getProperty("/reporte.impuestosMC"),
                type: EdmType.Number,
                property: 'TeSalida/ImpuestosTotal'
            });
            //DD
            aCols.push({
                label: texts.getProperty("/reporte.totalMC"),
                type: EdmType.Number,
                property: 'TeSalida/MejorTotal'
            });
            //EE
            aCols.push({
                label: texts.getProperty("/reporte.subtotalNC"),
                type: EdmType.Number,
                property: 'TeSalida/NcargoMc'
            });
            //FF
            aCols.push({
                label: texts.getProperty("/reporte.impuestosNC"),
                type: EdmType.Number,
                property: 'TeSalida/NcargoImpMc'
            });
            //GG
            aCols.push({
                label: texts.getProperty("/reporte.totalNC"),
                type: EdmType.Number,
                property: 'TeSalida/NcargoTotMc'
            });
            //HH
            aCols.push({
                label: texts.getProperty("/reporte.Estatus"),
                type: EdmType.String,
                property: 'TeSalida/Estatus'
            });
            //II
            aCols.push({
                label: texts.getProperty("/reporte.Estatus"),
                type: EdmType.String,
                property: 'TeSalida/DescEstat'
            });
            //JJ




            return aCols;
        },

        _onDocumentMatched: function (oEvent) {
            this._document = oEvent.getParameter("arguments").document || this._document || "0";
            this._proveedor = oEvent.getParameter("arguments").proveedor || this._proveedor || "0";
            this._serie = oEvent.getParameter("arguments").serie || this._serie || "";
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
                proveedor: this._proveedor,
                serie: this._serie,
                fecha: this._fecha
            });
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.oRouter.navTo("EstadoCuentaReporte", {
                layout: sNextLayout,
                document: this._document,
                proveedor: this._proveedor,
                serie: this._serie,
                fecha: this._fecha
            });
        },
        handleClose: function () {
            console.log('on hanlde close')
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
           // this.oRouter.navTo("EstadoCuenta", {});
            this.onBackPreviousView()
        },

         padLeadingZeros: function(num, size) {
            var s = num+"";
            while (s.length < size) s = "0" + s;
            return s;
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
