sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/f/library',
    "sap/ui/table/RowAction",
    "sap/ui/table/RowActionItem",
    "sap/ui/table/RowSettings",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
], function (BaseController, Controller, JSONModel, fioriLibrary, RowAction, RowActionItem, RowSettings, exportLibrary, Spreadsheet) {
    "use strict";

    var EdmType = exportLibrary.EdmType;


    return BaseController.extend("demo.controllers.ValidacionCondiciones.MasterValidaciones", {

        onInit: function () {
            $(document).ready(function () {
                $(document).on('focus', ':input', function () {
                    $(this).attr('autocomplete', 'off');
                });
            });

            this.VisibleTable();
        },

        searchData2: function () {
            var that = this;
            var url = "/sap/opu/odata/sap/ZOSP_MEJOR_COND_REP_SRV/RepMejorCondSet";
            if (this.getView().byId("supplierInput").getValue() !== "") {

                url = url + "?$filter=(IAcre eq '" + (this.getView().byId("supplierInput").getValue().split("-")[0].trim()).padStart(10, 0) + "'"
            } else {

                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/ValCondi.ErrorPRoveedor'));
                return
            }

            if (that.getView().byId("IDSerie").getValue() !== "") {
                url = url + "and ISerie eq '" + that.getView().byId("IDSerie").getValue() + "'"
            }
            if (that.getView().byId("IDFolio").getValue() !== "") {
                url = url + " and IFolio eq '" + that.getView().byId("IDFolio").getValue() + "'"
            }
            if (that.getView().byId("dateRange").getValue() !== "") {
                if (that.getView().byId("dateRange").getValue().split("-")[1].trim() === that.getView().byId("dateRange").getValue().split("-")[0].trim()) {
                    var FechaI = that.getView().byId("dateRange").getDateValue();
                    var FechaF = that.getView().byId("dateRange").getDateValue();
                } else {
                    var FechaI = that.getView().byId("dateRange").getDateValue();
                    var FechaF = that.getView().byId("dateRange").getSecondDateValue();
                }
                url = url + "and (IFe ge '" + FechaI.toISOString().slice(0, 10).replaceAll('-', '') + "' and IFe le '" + FechaF.toISOString().slice(0, 10).replaceAll('-', '') + "')"
            }
            url = url + ')'
            // /sap/opu/odata/sap/ZOSP_MEJOR_COND_REP_SRV/RepMejorCondSet?$filter=(IAcre eq '0000229732' and ISerie eq 'B' and IFolio eq '81987' and (IFe ge '20220706' and IFe le '20220730'))

          
            sap.ui.core.BusyIndicator.show();
            that._GEToDataV2ajax(url).then(function (_GEToDataV2Response) {
                sap.ui.core.BusyIndicator.hide();

                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }
               
                var data = _GEToDataV2Response.d.results;
             
                var oSLocation = data.map(function (e) {
                    return e.TeSalida.DocCompra;
                }).filter(onlyUnique).map(function (e, i) {
                    return {
                        key: i,
                        value: e
                    };
                });
              
                var arrt = []
               
                
                for (var x = 0; x < oSLocation.length; x++) {
                    var CantidadSap = 0;
                    var Cantidad = 0;
                    var MejorCantidad = 0;
                    var MejorPrecio = 0;
                    var PrecioUnSi = 0;
                    var PrecCDescSap = 0;
                    var ImporteSap = 0;
                    var ImporteTotal = 0;
                    var MejorSubtotal = 0;
                    var ImpuestosSap = 0;
                    var ImpuestosFact = 0;
                    var ImpuestosTotal = 0;
                    var ImpTotCImpSap = 0;
                    var ImporteTotCi = 0;
                    var MejorTotal = 0;
                    var NcargoMc = 0;
                    var NcargoImpMc = 0;
                    var NcargoTotMc = 0;
                     var DocCompra=0;


                    
                    for (var y = 0; y < data.length; y++) {

                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            CantidadSap = CantidadSap + Number(data[y].TeSalida.CantidadSap);
                        }
                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            Cantidad = Cantidad + Number(data[y].TeSalida.Cantidad);
                        }
                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            MejorCantidad = MejorCantidad + Number(data[y].TeSalida.MejorCantidad);
                        }
                        
                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            PrecCDescSap = PrecCDescSap + Number(data[y].TeSalida.PrecCDescSap);
                        }

                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            PrecioUnSi = PrecioUnSi + Number(data[y].TeSalida.PrecioUnSi);
                        }
                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            MejorPrecio = MejorPrecio + Number(data[y].TeSalida.MejorPrecio);
                        }

                      
                        
                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            ImporteSap = ImporteSap + Number(data[y].TeSalida.ImporteSap);
                        }
                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            ImporteTotal = ImporteTotal + Number(data[y].TeSalida.ImporteTotal);
                        }
                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            MejorSubtotal = MejorSubtotal + Number(data[y].TeSalida.MejorSubtotal);
                        }
                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            ImpuestosSap = ImpuestosSap + Number(data[y].TeSalida.ImpuestosSap);
                        }
                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            ImpuestosFact = ImpuestosFact + Number(data[y].TeSalida.ImpuestosFact);
                        }

                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            ImpuestosTotal = ImpuestosTotal + Number(data[y].TeSalida.ImpuestosTotal);
                        }

                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            ImpTotCImpSap = ImpTotCImpSap + Number(data[y].TeSalida.ImpTotCImpSap);
                        }

                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            ImporteTotCi = ImporteTotCi + Number(data[y].TeSalida.ImporteTotCi);
                        }

                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            MejorTotal = MejorTotal + Number(data[y].TeSalida.MejorTotal);
                        }

                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            NcargoMc = NcargoMc + Number(data[y].TeSalida.NcargoMc);
                        }
                        //
                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            NcargoImpMc = NcargoImpMc + Number(data[y].TeSalida.NcargoImpMc);
                        }

                        if (data[y].TeSalida.DocCompra === oSLocation[x].value) {
                            NcargoTotMc = NcargoTotMc + Number(data[y].TeSalida.NcargoTotMc);
                        }
                        DocCompra=oSLocation[x].value;

                    }

                
                  
                  
                   
                    var ARRT = {
                        EMsj: "",
                        IAcre: "",
                        ICmsu: "",
                        IDocmat: "",
                        IEsta: "",
                        IFe: "",
                        IFolio: "",
                        INe: "",
                        IPedi: "",
                        ISerie: "",
                        TeSalida: {
                            Cantidad: Cantidad.toFixed(2),
                            CantidadSap: CantidadSap.toFixed(2),
                            Cmsucfol: "",
                            DescEstat: "",
                            DocCargo: "",
                            DocCompra: DocCompra,
                            DocFactura: "",
                            DocMaterial: "",
                            EanUpc: "",
                            Estatus: "",
                            FechaRegSap: "",
                            FecharSap: "",
                            FolionEntrada: "",
                            ImpTotCImpSap: ImpTotCImpSap.toFixed(2),
                            ImporteSap: ImporteSap.toFixed(2),
                            ImporteTotCi: ImporteTotCi.toFixed(2),
                            ImporteTotal: ImporteTotal.toFixed(2),
                            ImpuestosFact: ImpuestosFact.toFixed(2),
                            ImpuestosSap: ImpuestosSap.toFixed(2),
                            ImpuestosTotal: ImpuestosTotal.toFixed(2),
                            Lifnr: "",
                            Material: "",
                            MaterialSap: "",
                            MejorCantidad: MejorCantidad.toFixed(2),
                            MejorPrecio: MejorPrecio.toFixed(2),
                            MejorSubtotal: MejorSubtotal.toFixed(2),
                            MejorTotal: MejorTotal.toFixed(2),
                            NcargoImpMc:NcargoImpMc.toFixed(2),
                            NcargoMc: NcargoMc.toFixed(2),
                            NcargoTotMc: NcargoTotMc.toFixed(2),
                            Posicion: "",
                            PrecCDescSap: PrecCDescSap.toFixed(2),
                            PrecioUnSi: PrecioUnSi.toFixed(2),
                            Serfol: "",
                            UmedidaPSap: "",
                            Unidad: "",
                        }
                    }
                   
                    data.push(ARRT)



                }
                data.sort(function (a, b) {
                    if (a.TeSalida.DocCompra > b.TeSalida.DocCompra) {
                      return 1;
                    }
                    if (a.TeSalida.DocCompra < b.TeSalida.DocCompra) {
                      return -1;
                    }
                  
                    return 0;
                  });
                var auxJsonModel = new sap.ui.model.json.JSONModel(data);
                that.getView().setModel(auxJsonModel, 'ModelValidacion');
            });

        },

        /*  searchData: function () {
              var that = this;
              // /sap/opu/odata/sap/ZOSP_MEJOR_COND_REP_SRV/RepMejorCondSet?$filter=(IAcre eq '0000229732' and ISerie eq 'B' and IFolio eq '81987' and IFe eq '20220706')
              var auxFilters = [];
              if (this.getView().byId("supplierInput").getValue() !== "") {
                  var valor = "";
  
                  auxFilters.push(new sap.ui.model.Filter({
                      path: "IAcre",
                      operator: sap.ui.model.FilterOperator.EQ,
                      value1: this.getView().byId("supplierInput").getValue().split("-")[1].trim()
                  })
                  )
              } else {
  
                  sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/ValCondi.ErrorPRoveedor'));
                  return
              }
  
  
  
              if (that.getView().byId("dateRange").getValue() !== "") {
                  if (that.getView().byId("dateRange").getValue().split("-")[1].trim() === that.getView().byId("dateRange").getValue().split("-")[0].trim()) {
                      var FechaI = that.getView().byId("dateRange").getDateValue();
                      var FechaF = that.getView().byId("dateRange").getDateValue();
                  } else {
                      var FechaI = that.getView().byId("dateRange").getDateValue();
                      var FechaF = that.getView().byId("dateRange").getSecondDateValue();
                  }
          
                  auxFilters.push(new sap.ui.model.Filter({
                      path: "IFe",
                      operator: sap.ui.model.FilterOperator.GE,
                      value1: FechaI.toISOString().slice(0, 10) + 'T00:00:00'
                      // value2: FechaF.toISOString().slice(0, 10) + 'T00:00:00'
  
                  })
                  )
                 
              }
              if (that.getView().byId("IDFolio").getValue() !== "") {
                  auxFilters.push(new sap.ui.model.Filter({
                      path: "IFolio",
                      operator: sap.ui.model.FilterOperator.EQ,
                      value1: that.getView().byId("IDFolio").getValue()
                  })
                  )
  
              }
              if (that.getView().byId("IDSerie").getValue() !== "") {
                  auxFilters.push(new sap.ui.model.Filter({
                      path: "ISerie",
                      operator: sap.ui.model.FilterOperator.EQ,
                      value1: that.getView().byId("IDSerie").getValue()
                  })
                  )
  
              }
  
            
  
              var model = "ZOSP_MEJOR_COND_REP_SRV";
              var entity = "RepMejorCondSet";
              var expand = "";
              var filter = auxFilters;
              var select = "";
              console.log(filter)
              sap.ui.core.BusyIndicator.show();
              that._GEToDataV2(model, entity, filter, expand, select).then(function (_GEToDataV2Response) {
                  sap.ui.core.BusyIndicator.hide();
                  var data = _GEToDataV2Response.data.results;
                  console.log(data)
                 
                  var auxJsonModel = new sap.ui.model.json.JSONModel(data);
                  that.getView().setModel(auxJsonModel, 'ModelValidacion');
              });
  
          },*/
        VisibleTable: function () {

            var that = this;
            that.oModel = new JSONModel({
                A: true,
                B: false,
                C: true,
                D: false,
                E: false,
                F: false,
                G: false,
                H: true,
                I: false,
                J: false,
                K: false,
                L: false,
                M: true,
                N: true,
                O: true,
                P: true,
                Q: false,
                R: false,
                S: false,
                T: false,
                U: true,
                V: true,
                W: true,
                X: true,
                Y: true,
                Z: true,
                AA: true,
                BB: true,
                CC: true,
                DD: true,
                EE: true,
                FF: true,
                GG: true,
                HH: false,
                II: true,
                //  JJ: false,
            })
            that.getView().setModel(that.oModel);
            that.TableVisible()




        },
        TableVisible: function () {
            var that = this;


            that.getView().byId("A").setVisible(that.getView().getModel().getProperty("/A"));
            that.getView().byId("B").setVisible(that.getView().getModel().getProperty("/B"));
            that.getView().byId("C").setVisible(that.getView().getModel().getProperty("/C"));
            that.getView().byId("D").setVisible(that.getView().getModel().getProperty("/D"));
            that.getView().byId("E").setVisible(that.getView().getModel().getProperty("/E"));

            that.getView().byId("F").setVisible(that.getView().getModel().getProperty("/F"));
            that.getView().byId("G").setVisible(that.getView().getModel().getProperty("/G"));
            that.getView().byId("H").setVisible(that.getView().getModel().getProperty("/H"));
            that.getView().byId("I").setVisible(that.getView().getModel().getProperty("/I"));
            that.getView().byId("J").setVisible(that.getView().getModel().getProperty("/J"));

            that.getView().byId("K").setVisible(that.getView().getModel().getProperty("/K"));
            that.getView().byId("L").setVisible(that.getView().getModel().getProperty("/L"));
            that.getView().byId("M").setVisible(that.getView().getModel().getProperty("/M"));
            that.getView().byId("N").setVisible(that.getView().getModel().getProperty("/N"));
            that.getView().byId("O").setVisible(that.getView().getModel().getProperty("/O"));

            that.getView().byId("P").setVisible(that.getView().getModel().getProperty("/P"));
            that.getView().byId("Q").setVisible(that.getView().getModel().getProperty("/Q"));
            that.getView().byId("R").setVisible(that.getView().getModel().getProperty("/R"));
            that.getView().byId("S").setVisible(that.getView().getModel().getProperty("/S"));
            that.getView().byId("T").setVisible(that.getView().getModel().getProperty("/T"));

            that.getView().byId("U").setVisible(that.getView().getModel().getProperty("/U"));
            that.getView().byId("V").setVisible(that.getView().getModel().getProperty("/V"));
            that.getView().byId("W").setVisible(that.getView().getModel().getProperty("/W"));
            that.getView().byId("X").setVisible(that.getView().getModel().getProperty("/X"));
            that.getView().byId("Y").setVisible(that.getView().getModel().getProperty("/Y"));

            that.getView().byId("Z").setVisible(that.getView().getModel().getProperty("/Z"));
            that.getView().byId("AA").setVisible(that.getView().getModel().getProperty("/AA"));
            that.getView().byId("BB").setVisible(that.getView().getModel().getProperty("/BB"));
            that.getView().byId("CC").setVisible(that.getView().getModel().getProperty("/CC"));
            that.getView().byId("DD").setVisible(that.getView().getModel().getProperty("/DD"));

            that.getView().byId("EE").setVisible(that.getView().getModel().getProperty("/EE"));
            that.getView().byId("FF").setVisible(that.getView().getModel().getProperty("/FF"));
            that.getView().byId("GG").setVisible(that.getView().getModel().getProperty("/GG"));
            that.getView().byId("HH").setVisible(that.getView().getModel().getProperty("/HH"));
            that.getView().byId("II").setVisible(that.getView().getModel().getProperty("/II"));





        },
        ConfigTable: function () {
            var that = this;
            var oDialog = that.getView().byId("dinamicTableVC");

            // create dialog lazily
            if (!oDialog) {
                // create dialog via fragment factory
                oDialog = sap.ui.xmlfragment(that.getView().getId(), "demo.views.ValidacionCondiciones.Fragment.optionVC", this);
                that.getView().addDependent(oDialog);
                that.getView().byId("dinamicTableVC").addStyleClass(that.getOwnerComponent().getContentDensityClass());

            }

            oDialog.open();
        },
        ClosepopUp: function () {
            var that = this;
            that.TableVisible();
            that.getView().byId("dinamicTableVC").close();
        },
        onParentClicked: function (oEvent) {
            var bSelected = oEvent.getParameter("selected");
            this.oModel.setData({
                A: bSelected,
                B: bSelected,
                C: bSelected,
                D: bSelected,
                E: bSelected,
                F: bSelected,
                G: bSelected,
                H: bSelected,
                I: bSelected,
                J: bSelected,
                K: bSelected,
                L: bSelected,
                M: bSelected,
                N: bSelected,
                O: bSelected,
                P: bSelected,
                Q: bSelected,
                R: bSelected,
                S: bSelected,
                T: bSelected,
                U: bSelected,
                V: bSelected,
                W: bSelected,
                X: bSelected,
                Y: bSelected,
                Z: bSelected,
                AA: bSelected,
                BB: bSelected,
                CC: bSelected,
                DD: bSelected,
                EE: bSelected,
                FF: bSelected,
                GG: bSelected,
                HH: bSelected,
                II: bSelected,
                JJ: bSelected,

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
            //A
            aCols.push({
                label: texts.getProperty("/ValCondi.headerOrden"),
                type: EdmType.String,
                property: 'TeSalida/DocCompra'
            });
            //B
            aCols.push({
                label: texts.getProperty("/ValCondi.headerPosicion"),
                type: EdmType.String,
                property: 'TeSalida/Posicion'
            });
            //C
            aCols.push({
                label: texts.getProperty("/ValCondi.headerNE"),
                type: EdmType.String,
                property: 'TeSalida/FolionEntrada'
            });
            //D
            aCols.push({
                label: texts.getProperty("/ValCondi.headerEntradaMercancia"),
                type: EdmType.String,
                property: 'TeSalida/DocMaterial'
            });
            //E
            aCols.push({
                label: texts.getProperty("/ValCondi.headerRegFactura"),
                type: EdmType.String,
                property: 'TeSalida/DocFactura'
            });
            //F
            aCols.push({
                label: texts.getProperty("/ValCondi.folioCargo"),
                type: EdmType.String,
                property: 'TeSalida/DocCargo'
            });
            //G
            aCols.push({
                label: texts.getProperty("/ValCondi.refInterna"),
                type: EdmType.String,
                property: 'TeSalida/Cmsucfol'
            });
            //H
            aCols.push({
                label: texts.getProperty("/ValCondi.EAN"),
                type: EdmType.String,
                property: 'TeSalida/EanUpc'
            });
            //I
            aCols.push({
                label: texts.getProperty("/ValCondi.mterialRecibo"),
                type: EdmType.String,
                property: 'TeSalida/MaterialSap'
            });
            //J
            aCols.push({
                label: texts.getProperty("/ValCondi.fechaRecibo"),
                type: EdmType.String,
                property: 'TeSalida/FecharSap'
            });
            //K
            aCols.push({
                label: texts.getProperty("/ValCondi.unidadRecibo"),
                type: EdmType.String,
                property: 'TeSalida/UmedidaPSap'
            });
            //L
            aCols.push({
                label: texts.getProperty("/ValCondi.cantidadRecibo"),
                type: EdmType.Number,
                property: 'TeSalida/CantidadSap'
            });
            //M
            aCols.push({
                label: texts.getProperty("/ValCondi.costoRecibo"),
                type: EdmType.Number,
                property: 'TeSalida/PrecCDescSap'
            });
            //N
            aCols.push({
                label: texts.getProperty("/ValCondi.subtotalRecibo"),
                type: EdmType.Number,
                property: 'TeSalida/ImporteSap'
            });
            //O
            aCols.push({
                label: texts.getProperty("/ValCondi.impuestosRecibo"),
                type: EdmType.Number,
                property: 'TeSalida/ImpuestosSap'
            });
            //P
            aCols.push({
                label: texts.getProperty("/ValCondi.totalRecibo"),
                type: EdmType.Number,
                property: 'TeSalida/ImpTotCImpSap'
            });
            //Q
            aCols.push({
                label: texts.getProperty("/ValCondi.recepcionCFDI"),
                type: EdmType.String,
                property: 'TeSalida/FechaRegSap'
            });
            //R
            aCols.push({
                label: texts.getProperty("/ValCondi.factura"),
                type: EdmType.String,
                property: 'TeSalida/Serfol'
            });
            //S
            aCols.push({
                label: texts.getProperty("/ValCondi.materialCFDI"),
                type: EdmType.String,
                property: 'TeSalida/Material'
            });
            //T

            aCols.push({
                label: texts.getProperty("/ValCondi.unidadMedida"),
                type: EdmType.String,
                property: 'TeSalida/Unidad'
            });
            //U
            aCols.push({
                label: texts.getProperty("/ValCondi.cantidadCFDI"),
                type: EdmType.Number,
                property: 'TeSalida/Cantidad'
            });
            //V
            aCols.push({
                label: texts.getProperty("/ValCondi.costoCFDI"),
                type: EdmType.Number,
                property: 'TeSalida/PrecioUnSi'
            });
            //W
            aCols.push({
                label: texts.getProperty("/ValCondi.subtotalCFDI"),
                type: EdmType.Number,
                property: 'TeSalida/ImporteTotal'
            });
            //X
            aCols.push({
                label: texts.getProperty("/ValCondi.impuestosCFDI"),
                type: EdmType.Number,
                property: 'TeSalida/ImpuestosFact'
            });
            //Y
            aCols.push({
                label: texts.getProperty("/ValCondi.totalCFDI"),
                type: EdmType.Number,
                property: 'TeSalida/ImporteTotCi'
            });
            //Z
            aCols.push({
                label: texts.getProperty("/ValCondi.cantidadMC"),
                type: EdmType.Number,
                property: 'TeSalida/MejorCantidad'
            });
            //AA
            aCols.push({
                label: texts.getProperty("/ValCondi.costoMC"),
                type: EdmType.Number,
                property: 'TeSalida/MejorPrecio'
            });
            //BB
            aCols.push({
                label: texts.getProperty("/ValCondi.subtotalMC"),
                type: EdmType.Number,
                property: 'TeSalida/MejorSubtotal'
            });
            //CC
            aCols.push({
                label: texts.getProperty("/ValCondi.impuestosMC"),
                type: EdmType.Number,
                property: 'TeSalida/ImpuestosTotal'
            });
            //DD
            aCols.push({
                label: texts.getProperty("/ValCondi.totalMC"),
                type: EdmType.Number,
                property: 'TeSalida/MejorTotal'
            });
            //EE
            aCols.push({
                label: texts.getProperty("/ValCondi.subtotalNC"),
                type: EdmType.Number,
                property: 'TeSalida/NcargoMc'
            });
            //FF
            aCols.push({
                label: texts.getProperty("/ValCondi.impuestosNC"),
                type: EdmType.Number,
                property: 'TeSalida/NcargoImpMc'
            });
            //GG
            aCols.push({
                label: texts.getProperty("/ValCondi.totalNC"),
                type: EdmType.Number,
                property: 'TeSalida/NcargoTotMc'
            });
            //HH
            aCols.push({
                label: texts.getProperty("/ValCondi.Estatus"),
                type: EdmType.String,
                property: 'TeSalida/Estatus'
            });
            //II
            aCols.push({
                label: texts.getProperty("/ValCondi.Estatus"),
                type: EdmType.String,
                property: 'TeSalida/DescEstat'
            });
            //JJ




            return aCols;
        },
        //exporta excel
        buildExportTable: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable, that = this;

            if (!that._oTable) {
                that._oTable = this.byId('tableValidacion');
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
                fileName: 'Validador de Condiciones',
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },

       


    });

});
