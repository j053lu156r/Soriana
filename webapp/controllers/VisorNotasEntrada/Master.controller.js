sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode",
    "sap/ui/table/RowAction",
    "sap/ui/table/RowActionItem",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet"
], function (Controller, JSONModel, BindingMode, RowAction, RowActionItem, exportLibrary, Spreadsheet) {
    "use strict";
    var EdmType = exportLibrary.EdmType;

    var sUri = "/sap/opu/odata/sap/ZOSP_MMIM_MIGO_DOC_SRV/";

    return Controller.extend("demo.controllers.VisorNotasEntrada.Master", {
        onInit: function () {
            	//Sentencia para borrar cache de input
			$(document).ready(function () {
				$(document).on('focus', ':input', function () {
					$(this).attr('autocomplete', 'off');
				});
			});
            this.configFilterLanguage(this.getView().byId("filterBar"));

            this._oPropertiesModel = new JSONModel({
                rowsCount: ""
            });

            this._oPropertiesModel.setDefaultBindingMode(BindingMode.TwoWay);
            this.getOwnerComponent().setModel(this._oPropertiesModel, "properties");
            this.VisibleTable();
           
          

        },

        VisibleTable: function () {

            var that = this;
            that.oModel = new JSONModel({
                idMblnr: true,
                idEbeln: true,
              
                idBudatMkpf: true,
                idWerks: true,
                idXblnr: true,
idXblnr2: true

              
            })
            that.getView().setModel(that.oModel);
            that.TableVisible()
            var texts = that.getOwnerComponent().getModel("appTxts");
           var data=[];
           data.push(
        {"text":texts.getProperty("/visor.invoice"),  "key":"XblnrFact"},
           {"text": texts.getProperty("/visor.Frecibo"),  "key":"Xblnr"},
            {"text":texts.getProperty("/visor.order"),  "key":"Ebeln"}
           )
           
            var auxJsonModel = new sap.ui.model.json.JSONModel(data);
            that.getView().setModel(auxJsonModel, 'OPFiltros');
            var Fecha= new Date();
           
            Fecha = (Fecha.getTime() - (1000*60*60*24*90))
          
         that.getView().byId("dateRange").setDateValue(new Date(Fecha));
         that.getView().byId("dateRange").setSecondDateValue(new Date());

         

        },
        TableVisible: function () {
            var that = this;

            that.getView().byId("idMblnr").setVisible(that.getView().getModel().getProperty("/idMblnr"));
            that.getView().byId("idEbeln").setVisible(that.getView().getModel().getProperty("/idEbeln"));
           
            that.getView().byId("idBudatMkpf").setVisible(that.getView().getModel().getProperty("/idBudatMkpf"));
            that.getView().byId("idWerks").setVisible(that.getView().getModel().getProperty("/idWerks"));
            that.getView().byId("idXblnr").setVisible(that.getView().getModel().getProperty("/idXblnr"));
            that.getView().byId("idXblnr2").setVisible(that.getView().getModel().getProperty("/idXblnr2"));
            
           

        },
        Validacion:function(){
            var that=this;
           
            if(!that.getView().byId("OPFiltrosC").getSelectedKey()){
            
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/visor.ComboboxError'));
               
                that.getView().byId("inpInvoice").setValue("")
                return false;
            }
        },
        onPress: function (oEvent) {
           
          
            var oSelectedItem = oEvent.getSource().getParent();
            var that=this;
         
			var Mblnr = oSelectedItem.getBindingContext("migoModel").getProperty("Mblnr");
			var Mjahr = oSelectedItem.getBindingContext("migoModel").getProperty("Mjahr");
            var Ebeln= oSelectedItem.getBindingContext("migoModel").getProperty("Ebeln");
            var Lifnr= oSelectedItem.getBindingContext("migoModel").getProperty("Lifnr");
            var BudatMkpf= oSelectedItem.getBindingContext("migoModel").getProperty("BudatMkpf");
            var Werks= oSelectedItem.getBindingContext("migoModel").getProperty("Werks");
           var  Xblnr= oSelectedItem.getBindingContext("migoModel").getProperty("XblnrFact");
           
      
         if (Xblnr===''){
            Xblnr='0.1'
         }
              this.getOwnerComponent().getRouter().navTo("detailVisorNotas", { layout: sap.f.LayoutType.MidColumnFullScreen, Mblnr:Mblnr, Mjahr:Mjahr,Ebeln:Ebeln, Lifnr:Lifnr, BudatMkpf:BudatMkpf, Werks:Werks, Xblnr:Xblnr});
         
           

        },

        searchData: function () {
            var that = this
            var Model = that.getView().getModel("configSite").getData();
            if (that.getView().byId("supplierInput").getValue() === '') {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/visor.SearchError'));
                return false;
            }


            var auxFilters = [];



            var FechaI = that.getView().byId("dateRange").getDateValue();
            var FechaF = that.getView().byId("dateRange").getSecondDateValue();


            auxFilters.push(new sap.ui.model.Filter({
                path: "BudatMkpf",
                operator: sap.ui.model.FilterOperator.BT,
                value1: FechaI.toISOString().slice(0, 10) + 'T00:00:00',
                value2:FechaF.toISOString().slice(0, 10) + 'T00:00:00'
            })
         
            )
            auxFilters.push(new sap.ui.model.Filter({
                path: "Lifnr",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: Model.supplierInputKey
            })
            )
            if (this.getView().byId("inpInvoice").getValue()!==""){
                var valor="";
              
                
               
                auxFilters.push(new sap.ui.model.Filter({
                    path: that.getView().byId("OPFiltrosC").getSelectedKey(),
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1:this.getView().byId("inpInvoice").getValue()
                })
                )
            }


            var model = "ZOSP_MMIM_MIGO_DOC_SRV";
            var entity = "MIGO_DOC";
            var expand = "DocDetalleNav";
            var filter = auxFilters;
            var select = "";

            sap.ui.core.BusyIndicator.show();
            that._GEToDataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
                sap.ui.core.BusyIndicator.hide();
                var data = _GEToDataV2Response.data.results;
              
                for (var x = 0; x < data.length; x++) {
                    data[x].BudatMkpf = new Date(data[x].BudatMkpf).toISOString().slice(0, 10)
                }
                var auxJsonModel = new sap.ui.model.json.JSONModel(data);
                that.getView().setModel(auxJsonModel, 'migoModel');
                that.genereteRowAction();
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

            aCols.push({
                label: texts.getProperty("/visor.folio"),
                type: EdmType.String,
                property: 'Mblnr'
            });

            aCols.push({
                label: texts.getProperty("/visor.order"),
                type: EdmType.String,
                property: 'Ebeln'
            });
            aCols.push({
                label: texts.getProperty("/visor.supplier"),
                type: EdmType.String,
                property: 'Lifnr'
            });

            //****
            aCols.push({
                label: texts.getProperty("/visor.receivedDate"),
                type: EdmType.String,
                property: 'BudatMkpf'
            });

            aCols.push({
                label: texts.getProperty("/visor.branchOffice"),
                type: EdmType.String,
                property: 'Werks'
            });

            aCols.push({
                label: texts.getProperty("/visor.invoice"),
                type: EdmType.String,
                property: 'Xblnr'


            });

            aCols.push({
                label: texts.getProperty("/visor.SerieFolio"),
                type: EdmType.String,
                property: 'Mjahr'
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
                fileName: 'Notas de Entrada',
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },
        ConfigTable: function () {
            var that = this;
            var oDialog = that.getView().byId("dinamicTableNE");

            // create dialog lazily
            if (!oDialog) {
                // create dialog via fragment factory
                oDialog = sap.ui.xmlfragment(that.getView().getId(), "demo.views.VisorNotasEntrada.fragment.optionNE", this);
                that.getView().addDependent(oDialog);
                that.getView().byId("dinamicTableNE").addStyleClass(that.getOwnerComponent().getContentDensityClass());

            }

            oDialog.open();
        },
        ClosepopUp: function () {
            var that = this;
            that.TableVisible();
            that.getView().byId("dinamicTableNE").close();
        },
        onParentClicked: function (oEvent) {
            var bSelected = oEvent.getParameter("selected");
            this.oModel.setData({
                idMblnr: bSelected,
                idEbeln: bSelected,
              
                idBudatMkpf: bSelected,
                idWerks: bSelected,
                idXblnr: bSelected,
                idXblnr2:bSelected,

            });
        },
        DMAsivo :function(){
var that=this;
  var oModel = that.getView().getModel("migoModel").getData();
var arrT=[];

for(var x =0;x<oModel.length;x++){
var TemP=oModel[x].DocDetalleNav.results;
arrT.push({
    BudatMkpf:oModel[x].BudatMkpf,
    Ebeln: oModel[x].Ebeln,
    Lifnr: oModel[x].Lifnr,
    Mblnr: oModel[x].Mblnr,
    Mjahr: oModel[x].Mjahr,
    Werks: oModel[x].Werks,
    Xblnr: oModel[x].Xblnr,
    XblnrFact:oModel[x].XblnrFact,
    Ean11p: "",
    Ebelnp:"",
    Ebelpp:"",
    Erfmep: "",
    Erfmgp:"",
    Maktxp:"",
    Matnrp:"",
    Mblnrp: "",
    Meinsp:"",
    Mengep:"",
    Mjahrp: "",
    Zeilep: "",
});

for(var y =0;y<TemP.length;y++){
     
    arrT.push({
    BudatMkpf:"",
    Ebeln: "",
    Lifnr: "",
    Mblnr: "",
    Mjahr: "",
    Werks:"",
    Xblnr: "",
    XblnrFact:"",
    Ean11p: TemP[y].Ean11,
    Ebelnp:TemP[y].Ebeln,
    Ebelpp:TemP[y].Ebelp,
    Erfmep: TemP[y].Erfme,
    Erfmgp:TemP[y].Erfmg,
    Maktxp:TemP[y].Maktx,
    Matnrp: TemP[y].Matnr,
    Mblnrp: TemP[y].Mblnr,
    Meinsp: TemP[y].Meins,
    Mengep: TemP[y].Menge,
    Mjahrp: TemP[y].Mjahr,
    Zeilep: TemP[y].Zeile,
    Fconverp: (Number(TemP[y].Menge)/Number(TemP[y].Erfmg))
});
}
}

var auxJsonModel = new sap.ui.model.json.JSONModel(arrT);
that.getView().setModel(auxJsonModel, 'ExcelMasivo');
this.buildExportTable2();

        },

        createColumnConfig2: function () {
            var that = this;
          
            var oModel = that.getView().getModel("ExcelMasivo").getData(),
                aCols = [];
          
            var texts = this.getOwnerComponent().getModel("appTxts");

            aCols.push({
                label: texts.getProperty("/visor.folio"),
                type: EdmType.String,
                property: 'Mblnr'
            });

            aCols.push({
                label: texts.getProperty("/visor.order"),
                type: EdmType.String,
                property: 'Ebeln'
            });
            aCols.push({
                label: texts.getProperty("/visor.supplier"),
                type: EdmType.String,
                property: 'Lifnr'
            });

            //****
            aCols.push({
                label: texts.getProperty("/visor.receivedDate"),
                type: EdmType.String,
                property: 'BudatMkpf'
            });

            aCols.push({
                label: texts.getProperty("/visor.branchOffice"),
                type: EdmType.String,
                property: 'Werks'
            });

            aCols.push({
                label: texts.getProperty("/visor.invoice"),
                type: EdmType.String,
                property: 'XblnrFact'


            });

            aCols.push({
                label: texts.getProperty("/visor.Frecibo"),
                type: EdmType.String,
                property: 'Xblnr'
            });


            //detalle

            
            aCols.push({
                label: texts.getProperty("/visor.position"),
                type: EdmType.String,
                property: 'Ebelpp'
            });

            aCols.push({
                label: texts.getProperty("/visor.codigo"),
                type: EdmType.String,
                property: 'Ean11p'
            });
            aCols.push({
                label: texts.getProperty("/visor.descripcion"),
                type: EdmType.String,
                property: 'Maktxp'
            });

            aCols.push({
                label: texts.getProperty("/visor.quantity"),
                type: EdmType.String,
                property: 'Erfmgp'
            });

            aCols.push({
                label: texts.getProperty("/visor.Fconver"),
                type: EdmType.String,
                property: 'Fconverp'
            });
            aCols.push({
                label: texts.getProperty("/visor.capacidad"),
                type: EdmType.String,
                property: 'Mengep'
            });


//19

            return aCols;
        },
        //exporta excel
        buildExportTable2: function () {
        /*    var aCols, oRowBinding, oSettings, oSheet, oTable, that = this;

            if (!that._oTable) {
                that._oTable = this.byId('tableVisor');
            }

            oTable = that._oTable;

            oRowBinding = oTable.getBinding().oList;

            aCols = that.createColumnConfig2();

            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Notas de Entrada',
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });*/
            var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfig2();
			aProducts = this.getView().getModel("ExcelMasivo").getProperty('/');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts,
                fileName: 'Notas de Entrada',
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
				
				})
				.finally(oSheet.destroy);
		
        },
        clearFilters: function () {
            this.getView().byId("inpInvoice").setValue('');
            this.getView().byId("dateRange").setValue('');
        },



    });
});