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

    return Controller.extend("demo.controllers.Statement.AcuerdosE", {
        onInit: function () {


            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("AcuerdosEC").attachPatternMatched(this._onDocumentMatched, this);

        },
        searchData: function () {
            let that = this;
            //ZOSP_ACUERDOS_SRV/AcuerdosGralSet?$filter=Lifnr%20eq%20%2711949%27%20and%20Belnr%20eq%20%275100004926%27
            var auxFilters = [];



            auxFilters.push(new sap.ui.model.Filter({
                path: "Lifnr",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: that.getConfigModel().getProperty("/supplierInputKey")
            })
            )
            auxFilters.push(new sap.ui.model.Filter({
                path: "Belnr",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: that._document
            })
            )
            var model = "ZOSP_ACUERDOS_SRV";
            var entity = "AcuerdosGralSet";
            var expand = "";
            var filter = auxFilters;
            var select = "";

            sap.ui.core.BusyIndicator.show();
            that._GEToDataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
                sap.ui.core.BusyIndicator.hide();

                var data = _GEToDataV2Response.data.results;
                console.log(data)
for(var x =0;x<data.length;x++){
    data[x].Fecca=data[x].Fecca.split("T")[0]

}


                if (data.length > 0) {
                    that.getView().byId("idEbeln").setVisible(false)
                    that.getView().byId("idMatnr").setVisible(false)
                    that.getView().byId("idCanti").setVisible(false)
                    that.getView().byId("idPvmat").setVisible(false)
                    that.getView().byId("Cumat").setVisible(false)
                    that.getView().byId("idCargo").setVisible(false)
                    //that.getView().byId("idTotca").setVisible(false)









                    var auxJsonModel = new sap.ui.model.json.JSONModel(data);
                    that.getView().setModel(auxJsonModel, 'ECuentaAcl');



                } else {
                    that.searchData2();
                }

            });

        },
        searchData2: function () {
            let that = this;
            //ZOSP_ACUERDOS_SRV/AcuerdosNserSet?$filter=Lifnr%20eq%20%2711949%27%20and%20Belnr%20eq%20%275100004926%27
            var auxFilters = [];



            auxFilters.push(new sap.ui.model.Filter({
                path: "Lifnr",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: that.getConfigModel().getProperty("/supplierInputKey")
            })
            )
            auxFilters.push(new sap.ui.model.Filter({
                path: "Belnr",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: that._document
            })
            )
            var model = "ZOSP_ACUERDOS_SRV";
            var entity = "AcuerdosNserSet";
            var expand = "";
            var filter = auxFilters;
            var select = "";

            sap.ui.core.BusyIndicator.show();
            that._GEToDataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
                sap.ui.core.BusyIndicator.hide();


                var data = _GEToDataV2Response.data.results;
                console.log(data)
                for(var x =0;x<data.length;x++){
                    data[x].Fecca=data[x].Fecca.split("T")[0]
                
                }
                if (data.length > 0) {
                    that.getView().byId("idFolio").setVisible(false)
                    that.getView().byId("idBase").setVisible(false)
                    that.getView().byId("idDesct").setVisible(false)
                    that.getView().byId("idPrdes").setVisible(false)






                    var auxJsonModel = new sap.ui.model.json.JSONModel(data);
                    that.getView().setModel(auxJsonModel, 'migoModel');
                } else {
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty('/state.Error'));
                }
            });

        },
        onExit: function () {
            let that = this;

            that.getView().byId("idEbeln").setVisible(true)
            that.getView().byId("idMatnr").setVisible(true)
            that.getView().byId("idCanti").setVisible(true)
            that.getView().byId("idPvmat").setVisible(true)
            that.getView().byId("Cumat").setVisible(true)
            that.getView().byId("idCargo").setVisible(true)
            that.getView().byId("idTotca").setVisible(true)
            that.getView().byId("idFolio").setVisible(true)
            that.getView().byId("idBase").setVisible(true)
            that.getView().byId("idDesct").setVisible(true)
            that.getView().byId("idPrdes").setVisible(true)
        },

        clearFilters: function () {

        },

        buildExportTable: function () {



            var aCols, oRowBinding, oSettings, oSheet, oTable, that = this;

            if (!that._oTable) {
                that._oTable = this.byId('aclaracionesList');
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
            var oModel = that.getView().getModel("migoModel").getData(),
                aCols = [];

            var texts = this.getOwnerComponent().getModel("appTxts");


            if (that.getView().byId("idLifnr").getVisible()) {
               
                aCols.push({
                    label: texts.getProperty("/stateA.proveedor"),
                    type: EdmType.String,
                    property: 'Lifnr'
                });
            }

            if (that.getView().byId("idBelnr").getVisible()) {
            aCols.push({
                label: texts.getProperty("/stateA.documento"),
                type: EdmType.String,
                property: 'Belnr'
            });
        }
        if (that.getView().byId("idConve").getVisible()) {
            aCols.push({
                label: texts.getProperty("/stateA.convenio"),
                type: EdmType.String,
                property: 'Conve'
            });
        }
        if (that.getView().byId("idWerks").getVisible()) {
            aCols.push({
                label: texts.getProperty("/stateA.centro"),
                type: EdmType.String,
                property: 'Werks'
            });
        } 
        if (that.getView().byId("idFolio").getVisible()) {
            aCols.push({
                label: texts.getProperty("/stateA.folio"),
                type: EdmType.String,
                property: 'Folio'
            });
        }
        if (that.getView().byId("idEbeln").getVisible()) {
            aCols.push({
                label: texts.getProperty("/stateA.pedido"),
                type: EdmType.String,
                property: 'Ebeln'
            });
        }
        if (that.getView().byId("idBase").getVisible()) { 
            aCols.push({
                label: texts.getProperty("/stateA.base"),
                type: EdmType.String,
                property: 'Base'
            });
        }
        if (that.getView().byId("idMatnr").getVisible()) {
            aCols.push({
                label: texts.getProperty("/stateA.material"),
                type: EdmType.String,
                property: 'Matnr'
            });
        }
        if (that.getView().byId("idCanti").getVisible()) {
            aCols.push({
                label: texts.getProperty("/stateA.cantidad"),
                type: EdmType.String,
                property: 'Canti'
            });
        }
        if (that.getView().byId("idPvmat").getVisible()) {
            aCols.push({
                label: texts.getProperty("/stateA.pvMat"),
                type: EdmType.String,
                property: 'Pvmat'
            });
        }
        if (that.getView().byId("Cumat").getVisible()) {
            aCols.push({
                label: texts.getProperty("/stateA.cuMat"),
                type: EdmType.String,
                property: 'Cumat'
            });
        }
        if (that.getView().byId("idDesct").getVisible()) {  
            aCols.push({
                label: texts.getProperty("/stateA.descto"),
                type: EdmType.Number,
                property: 'Desct'
            });
        }
        if (that.getView().byId("idCargo").getVisible()) {
            aCols.push({
                label: texts.getProperty("/stateA.cargo"),
                type: EdmType.Number,
                property: 'Cargo'
            });
        }
        if (that.getView().byId("idIeps").getVisible()) {
            aCols.push({
                label: texts.getProperty("/stateA.ieps"),
                type: EdmType.Number,
                property: 'Ieps'
            });
        }
        if (that.getView().byId("idIva").getVisible()) {
            aCols.push({
                label: texts.getProperty("/reporte.iva"),
                type: EdmType.Number,
                property: 'Iva'
            });
        }
      
        if (that.getView().byId("idPrdes").getVisible()) {
            aCols.push({
                label: texts.getProperty("/stateA.pDescto"),
                type: EdmType.Number,
                property: 'Prdes'
            });
        }
        if (that.getView().byId("idFecca").getVisible()) { 
            aCols.push({
                label: texts.getProperty("/stateA.fecCargo"),
                type: EdmType.String,
                property: 'Fecca'
            });
        }
        if (that.getView().byId("idTotca").getVisible()) {
            aCols.push({
                label: texts.getProperty("/stateA.totCargo"),
                type: EdmType.String,
                property: 'Totca'
            });
        }


            return aCols;
        },

        _onDocumentMatched: function (oEvent) {


            this._document = oEvent.getParameter("arguments").document || this._document || "0";
            this.sociedad = oEvent.getParameter("arguments").sociedad || this._proveedor || "0";


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
            this.onExit();

            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
            this.oRouter.navTo("EstadoCuenta", {});
            // this.onBackPreviousView()
        },













    });
});
