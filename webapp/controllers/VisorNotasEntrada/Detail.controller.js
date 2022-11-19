sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet"
], function (Controller, JSONModel, exportLibrary, Spreadsheet) {
    "use strict";
    var EdmType = exportLibrary.EdmType;

    return Controller.extend("demo.controllers.VisorNotasEntrada.Detail", {

        onInit: function () {
            	//Sentencia para borrar cache de input
			$(document).ready(function () {
				$(document).on('focus', ':input', function () {
					$(this).attr('autocomplete', 'off');
				});
			});
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();
        
            var Router = sap.ui.core.UIComponent.getRouterFor(this);
            Router.getRoute("detailVisorNotas").attachMatched(this._onRouteMatched, this)
            this.VisibleTable();
        },
        onAfterRendering: function () {

        },
        handleFullScreen: function (oEvent) {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.oRouter.navTo("detailVisorNotas", { layout: sap.f.LayoutType.MidColumnFullScreen });
        },

        handleExitFullScreen: function (oEvent) {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.oRouter.navTo("detailVisorNotas", { layout: sap.f.LayoutType.MidColumnFullScreen });
        },

        handleClose: function (oEvent) {
            this.oRouter.navTo("masterVisorNotas", { layout: this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn") });
        },
        ConfigTable: function () {
            var that = this;
            var oDialog = that.getView().byId("dinamicTableNED");

            // create dialog lazily
            if (!oDialog) {
                // create dialog via fragment factory
                oDialog = sap.ui.xmlfragment(that.getView().getId(), "demo.views.VisorNotasEntrada.fragment.optionNEDetail", this);
                that.getView().addDependent(oDialog);
                that.getView().byId("dinamicTableNED").addStyleClass(that.getOwnerComponent().getContentDensityClass());

            }

            oDialog.open();
        },
        ClosepopUp: function () {
            var that = this;
            that.TableVisible();
            that.getView().byId("dinamicTableNED").close();
        },
        _onRouteMatched: function (oEvent) {


            var ModeloN = oEvent.getParameter("arguments")
if (ModeloN.Xblnr==='0.1'){
ModeloN.Xblnr=""

}
if (ModeloN.XblnrFact==='0.1'){
    ModeloN.XblnrFact=""
    
    }
            var ModelD = []
            ModelD = {
                "Mblnr": ModeloN.Mblnr,
                "Mjahr": ModeloN.Mjahr,
                "Ebeln": ModeloN.Ebeln,
                "Lifnr": ModeloN.Lifnr,
                "BudatMkpf": ModeloN.BudatMkpf,
                "Werks": ModeloN.Werks,
                "Xblnr":ModeloN.Xblnr,
                "XblnrFact":ModeloN.XblnrFact,

                "posiciones": []


            };
            var that = this;
            var model = "ZOSP_MMIM_MIGO_DOC_SRV";
            //  var entity = "MIGO_DOC(Mblnr='5095076269',Mjahr='2022')/DocDetalleNav"
            var entity = "MIGO_DOC(Mblnr='" + ModeloN.Mblnr + "',Mjahr='" + ModeloN.Mjahr + "')/DocDetalleNav";
            //var expand = "DocDetalleNav";
            var filter = "";
            var expand = "";
            var suma=0

            sap.ui.core.BusyIndicator.show();
            that._GEToDataV2(model, entity, filter, expand).then(function (_GEToDataV2Response) {
                sap.ui.core.BusyIndicator.hide();
                var data = _GEToDataV2Response.data.results;
             
                var DataT=[];
                for (var x = 0; x < data.length; x++) {

                    suma=suma+Number(data[x].Menge)
                    DataT.push({
                        Ean11: data[x].Ean11 ,
                        Ebeln: data[x].Ebeln ,
                        Ebelp: data[x].Ebelp ,
                        Erfme: data[x].Erfme ,
                        Erfmg:data[x].Erfmg ,
                        Maktx:data[x].Maktx ,
                        Matnr: data[x].Matnr ,
                        Mblnr: data[x].Mblnr ,
                        Meins: data[x].Meins ,
                        Menge:data[x].Menge ,
                        Mjahr: data[x].Mjahr ,
                        Zeile: data[x].Zeile ,
                        Umrez:data[x].Umrez ,
                        Fconver: (Number(data[x].Menge)/Number(data[x].Erfmg)),
                        Ctotal:data[x].Menge +" "+data[x].Meins,
                        CPiezas:data[x].Erfmg+" "+data[x].Erfme

                    })
                }

              console.log(suma)
                var auxJsonModel = new sap.ui.model.json.JSONModel(DataT);
                that.getView().setModel(auxJsonModel, 'DetallePosiciones');
                that.getView().byId("sumatxt").setText(suma)

               
            });
           
            var auxJsonModel = new sap.ui.model.json.JSONModel(ModelD);
            that.getView().setModel(auxJsonModel, 'DetalleModel');
       
        },
        VisibleTable: function () {

            var that = this;
            that.oModel = new JSONModel({
                idEbelp: true,
                idEan11: true,
                idMaktx: true,
                idErfmg: true,
                idFconver: true,
                idMenge: true
               

            })
            that.getView().setModel(that.oModel);
            that.TableVisible()

        },
        TableVisible: function () {
            var that = this;






            that.getView().byId("idEbelp").setVisible(that.getView().getModel().getProperty("/idEbelp"));
            that.getView().byId("idEan11").setVisible(that.getView().getModel().getProperty("/idEan11"));
            that.getView().byId("idMaktx").setVisible(that.getView().getModel().getProperty("/idMaktx"));
            that.getView().byId("idErfmg").setVisible(that.getView().getModel().getProperty("/idErfmg"));
            that.getView().byId("idFconver").setVisible(that.getView().getModel().getProperty("/idFconver"));
            that.getView().byId("idMenge").setVisible(that.getView().getModel().getProperty("/idMenge"));
           

 
        },
        onParentClicked: function (oEvent) {
            var bSelected = oEvent.getParameter("selected");
            this.oModel.setData({
                idEbelp: bSelected,
                idEan11: bSelected,
                idMaktx: bSelected,
                idErfmg: bSelected,
                idFconver: bSelected,
                idMenge: bSelected


              
                
            });
        },

        createColumnConfig: function () {





            var that = this;
            var oModel = that.getView().getModel("migoModel").getData(),
                aCols = [];
           
            var texts = this.getOwnerComponent().getModel("appTxts");

            aCols.push({
                label: texts.getProperty("/visor.position"),
                type: EdmType.String,
                property: 'Ebelp'
            });

            aCols.push({
                label: texts.getProperty("/visor.codigo"),
                type: EdmType.String,
                property: 'Ean11'
            });
            aCols.push({
                label: texts.getProperty("/visor.descripcion"),
                type: EdmType.String,
                property: 'Maktx'
            });

            //****
            aCols.push({
                label: texts.getProperty("/visor.quantity"),
                type: EdmType.String,
                property: 'CPiezas'
            });

            aCols.push({
                label: texts.getProperty("/visor.capacidad"),
                type: EdmType.String,
                property: 'Fconver'
            });
            aCols.push({
                label: texts.getProperty("/visor.Fconver"),
                type: EdmType.String,
                property: 'Ctotal',
             
            });







            return aCols;
        },
        //exporta excel
        buildExportTable: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable, that = this;

            if (!that._oTable) {
                that._oTable = this.byId('tableVisor');
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
                fileName: 'Posiciones Notas de Entrada',
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },


    });
});