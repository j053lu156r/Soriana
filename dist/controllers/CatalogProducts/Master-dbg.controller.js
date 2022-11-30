sap.ui.define(
  [
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "demo/models/formatterCatPrd",
    "sap/ui/core/BusyIndicator",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
  ],
  function (
    BaseController,
    JSONModel,
    Fragment,
    MessageBox,
    Filter,
    FilterOperator,
    formatterCatPrd,
    BusyIndicator,
    exportLibrary,
    Spreadsheet,
    Export,
    ExportTypeCSV
  ) {
    "use strict";
    var EdmType = exportLibrary.EdmType;

    return BaseController.extend("demo.controllers.CatalogProducts.Master", {
      onInit: function () {
        //
      },
      //http://azdevgtwsq01.soriana.com:8000/sap/opu/odata/sap/ZOSP_MMPI_MATNR_LIST_SRV/$metadata
      //ZOSP_MMPI_MATNR_LIST_SRV/LIFNR_MATNR_LIST?$filter=Vendor eq '116467'

      onAfterRendering() {
        var Model = this.getView().getModel("configSite").getData();
        console.log(Model.supplierInputKey);
        if (Model.supplierInputKey !== undefined) {
          this.SearchDivision();
        }
        this.SearchFTienda();
        this.SearchTSurtido();
      },
      buscarD: function () {
        console.log("buscarD");
        var that = this;
        console.log(that.getView().byId("Ftienda").getValue());
        if (that.getView().byId("supplierInput").getValue() === "") {
          sap.m.MessageBox.error(
            this.getOwnerComponent()
              .getModel("appTxts")
              .getProperty("/visor.SearchError")
          );
          return false;
        }
        if (that.getView().byId("Ftienda").getValue() === "") {
          sap.m.MessageBox.error(
            this.getOwnerComponent()
              .getModel("appTxts")
              .getProperty("/visor.ftiendaError")
          );
          return false;
        }

        if (that.getView().byId("Ftienda").getValue() !== "HIPER") {
          that.busqueda_multiple();
        } else {
          that.busqueda_multiple();
        }
      },

      searchData: function () {
        console.log("searchData");
        if (!this.hasAccess(48)) {
          return false;
        }
        var that = this;
        var Model = that.getView().getModel("configSite").getData();
        if (that.getView().byId("supplierInput").getValue() === "") {
          sap.m.MessageBox.error(
            this.getOwnerComponent()
              .getModel("appTxts")
              .getProperty("/visor.SearchError")
          );
          return false;
        }

        if (that.getView().byId("Ftienda").getValue() === "") {
          sap.m.MessageBox.error(
            this.getOwnerComponent()
              .getModel("appTxts")
              .getProperty("/visor.ftiendaError")
          );
          return false;
        }
        var auxFilters = [];

        auxFilters.push(
          new sap.ui.model.Filter({
            path: "Vendor",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: Model.supplierInputKey,
          })
        );

        if (that.getView().byId("FDivision").getSelectedKey() !== "") {
          auxFilters.push(
            new sap.ui.model.Filter({
              path: "Node",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: that.getView().byId("FDivision").getSelectedKey(),
            })
          );
        }
        if (that.getView().byId("Fsurtido").getSelectedKey() !== "") {
          auxFilters.push(
            new sap.ui.model.Filter({
              path: "Dismm",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: that.getView().byId("Fsurtido").getSelectedKey(),
            })
          );
        }
        if (that.getView().byId("Ftienda").getSelectedKey() !== "") {
          auxFilters.push(
            new sap.ui.model.Filter({
              path: "EkorgT001w",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: that.getView().byId("Ftienda").getSelectedKey(),
            })
          );
        }
        if (that.getView().byId("SKU").getValue() !== "") {
          auxFilters.push(
            new sap.ui.model.Filter({
              path: "Ean11",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: that.getView().byId("SKU").getValue(),
            })
          );
        }

        var model = "ZOSP_MMPI_MATNR_LIST_SRV";
        var entity = "LIFNR_MATNR_LIST";
        var expand = "";
        var filter = auxFilters;
        var select = "";

        sap.ui.core.BusyIndicator.show();
        that
          ._GEToDataV2(model, entity, filter, expand, select)
          .then(function (_GEToDataV2Response) {
            sap.ui.core.BusyIndicator.hide();

            var data = _GEToDataV2Response.data.results;
            console.log(data);
            if (data.length > 0) {
              const cmModel = new sap.ui.model.json.JSONModel(data);
              that.getView().setModel(cmModel, "ModelTP");
              //  that.buildExportpiechart()

              that.DescargarLog();

              that.getView().byId("FDivision").setSelectedKey("");
              that.getView().byId("Fsurtido").setSelectedKey("");
              that.getView().byId("Ftienda").setSelectedKey("");
              that.getView().byId("SKU").setValue("");
            } else {
              sap.m.MessageBox.error("busqueda sin resultados");
              // sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.ValidacionMens'));
            }
          });
      },

      busqueda_multiple: function () {
        var auxFilters = [];
        var DatosG = [];
        var that = this;
        var Model = that.getView().getModel("configSite").getData();
        var top = 5000,
          skip = 0;
        auxFilters.push(
          new sap.ui.model.Filter({
            path: "Vendor",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: Model.supplierInputKey,
          })
        );

        if (that.getView().byId("FDivision").getSelectedKey() !== "") {
          auxFilters.push(
            new sap.ui.model.Filter({
              path: "Node",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: that.getView().byId("FDivision").getSelectedKey(),
            })
          );
        }
        if (that.getView().byId("Fsurtido").getSelectedKey() !== "") {
          auxFilters.push(
            new sap.ui.model.Filter({
              path: "Dismm",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: that.getView().byId("Fsurtido").getSelectedKey(),
            })
          );
        }
        if (that.getView().byId("Ftienda").getSelectedKey() !== "") {
          auxFilters.push(
            new sap.ui.model.Filter({
              path: "EkorgT001w",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: that.getView().byId("Ftienda").getSelectedKey(),
            })
          );
        }
        if (that.getView().byId("SKU").getValue() !== "") {
          auxFilters.push(
            new sap.ui.model.Filter({
              path: "Ean11",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: that.getView().byId("SKU").getValue(),
            })
          );
        }
        var modeloGLo = [];
        var model = "ZOSP_MMPI_MATNR_LIST_SRV";
        var entity = "LIFNR_MATNR_LIST";
        var expand = "";
        var filter = auxFilters;

        sap.ui.core.BusyIndicator.show();
        var indi = 0;

        foo(0);
        function foo(cont) {
          /*  return new Promise(function (fnResolve, fnReject) {
            for (var x = 0; x < 4; x++) {
              that._GEToDataV2(model, entity, filter, expand, top, skip).then(function (_GEToDataV2Response) {
                  var data = _GEToDataV2Response.data.results;
                  console.log(data);
                  if (data.length > 0) {
                    const cmModel = new sap.ui.model.json.JSONModel(data);
                    that.getView().setModel(cmModel, "ModelTP");
                  }
                });

              skip = skip + 5000;
            }
          });*/
          var p1 = new Promise((resolve, reject) => {
            var data = [];
            that
              ._GEToDataV2(model, entity, filter, expand, top, skip)
              .then(function (_GEToDataV2Response) {
                data = _GEToDataV2Response.data.results;
            
                console.log(data);
                if (data.length > 0) {
                  indi = Number(data[0].Zcount);
                  modeloGLo.push(data);
                }
                resolve(data);
              });

            skip = skip + 5000;
          });
          var p2 = new Promise((resolve, reject) => {
            var data = [];
            that
              ._GEToDataV2(model, entity, filter, expand, top, skip)
              .then(function (_GEToDataV2Response) {
                data = _GEToDataV2Response.data.results;
                console.log(data);
                if (data.length > 0) {
                  modeloGLo.push(data);
                }
                resolve(data);
              });

            skip = skip + 5000;
          });
          var p3 = new Promise((resolve, reject) => {
            var data = [];
            that
              ._GEToDataV2(model, entity, filter, expand, top, skip)
              .then(function (_GEToDataV2Response) {
                data = _GEToDataV2Response.data.results;
                console.log(data);
                if (data.length > 0) {
                  modeloGLo.push(data);
                }
                resolve(data);
              });

            skip = skip + 5000;
          });
          var p4 = new Promise((resolve, reject) => {
            var data = [];
            that
              ._GEToDataV2(model, entity, filter, expand, top, skip)
              .then(function (_GEToDataV2Response) {
                data = _GEToDataV2Response.data.results;
                console.log(data);
                if (data.length > 0) {
                  modeloGLo.push(data);
                }
                resolve(data);
              });

            skip = skip + 5000;
          });
          var p5 = new Promise((resolve, reject) => {
            var data = [];
            that
              ._GEToDataV2(model, entity, filter, expand, top, skip)
              .then(function (_GEToDataV2Response) {
                data = _GEToDataV2Response.data.results;
                console.log(data);
                if (data.length > 0) {
                  modeloGLo.push(data);
                }
                resolve(data);
              });

            skip = skip + 5000;
          });
          var p6 = new Promise((resolve, reject) => {
            var data = [];
            that
              ._GEToDataV2(model, entity, filter, expand, top, skip)
              .then(function (_GEToDataV2Response) {
                data = _GEToDataV2Response.data.results;
                console.log(data);
                if (data.length > 0) {
                  modeloGLo.push(data);
                }
                resolve(data);
              });

            skip = skip + 5000;
          });

          Promise.all([p1, p2, p3, p4, p5, p6])
            .then((values) => {
              cont = cont + 20000;
              console.log(values);
              console.log(modeloGLo);

              console.log(cont);
              if (cont < indi) {
                console.log(cont);
                foo(cont);
              } else {
                var dataT = [];
                for (var x = 0; x < modeloGLo.length; x++) {
                  for (var y = 0; y < modeloGLo[x].length; y++) {
                    dataT.push(modeloGLo[x][y]);
                  }
                }
                console.log(dataT);

                that.getView().byId("FDivision").setSelectedKey("");
                that.getView().byId("Fsurtido").setSelectedKey("");
                that.getView().byId("Ftienda").setSelectedKey("");
                that.getView().byId("SKU").setValue("");
                const cmModel = new sap.ui.model.json.JSONModel(dataT);
                that.getView().setModel(cmModel, "ModelTP");
                console.log(that.getView().getModel("ModelTP").getData());
                that.DescargarLog();
                sap.ui.core.BusyIndicator.hide();
              }
            })
            .catch((reason) => {
              console.log(reason);
            });
        }
      },

      SearchDivision: function () {
        var that = this;
        var Model = that.getView().getModel("configSite").getData();

        var auxFilters = [];
        auxFilters.push(
          new sap.ui.model.Filter({
            path: "Vendor",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: Model.supplierInputKey.toString(),
          })
        );

        var model = "ZOSP_MMPI_MATNR_LIST_SRV";
        var entity = "DIV_MATGRP_LIST";
        var expand = "";
        var filter = auxFilters;
        var select = "";

        sap.ui.core.BusyIndicator.show();
        that
          ._GEToDataV2(model, entity, filter, expand, select)
          .then(function (_GEToDataV2Response) {
            sap.ui.core.BusyIndicator.hide();

            var data = _GEToDataV2Response.data.results;
            console.log(data);
            const cmModel = new sap.ui.model.json.JSONModel(data);
            that.getView().setModel(cmModel, "Division");
          });
      },
      SearchFTienda: function () {
        var that = this;
        var model = "ZOSP_MMPI_MATNR_LIST_SRV";
        var entity = "EKORG_LIST";
        var expand = "";
        var filter = "";
        var select = "";

        sap.ui.core.BusyIndicator.show();
        that
          ._GEToDataV2(model, entity, filter, expand, select)
          .then(function (_GEToDataV2Response) {
            sap.ui.core.BusyIndicator.hide();

            var data = _GEToDataV2Response.data.results;
            console.log(data);

            const cmModel = new sap.ui.model.json.JSONModel(data);
            that.getView().setModel(cmModel, "Tienda");
          });
      },
      SearchTSurtido: function () {
        var that = this;
        var model = "ZOSP_MMPI_MATNR_LIST_SRV";
        var entity = "DISMM_LIST";
        var expand = "";
        var filter = "";
        var select = "";

        sap.ui.core.BusyIndicator.show();
        that
          ._GEToDataV2(model, entity, filter, expand, select)
          .then(function (_GEToDataV2Response) {
            sap.ui.core.BusyIndicator.hide();

            var data = _GEToDataV2Response.data.results;

            const cmModel = new sap.ui.model.json.JSONModel(data);
            that.getView().setModel(cmModel, "Surtido");
          });
      },

      createColumnConfig: function () {
        var that = this;
        var oModel = that.getView().getModel("ModelTP").getData(),
          aCols = [];
        console.log(oModel);
        var texts = this.getOwnerComponent().getModel("appTxts");

        aCols.push({
          label: texts.getProperty("/CatagProd.Exc1"),
          type: EdmType.String,
          property: "Node",
        });
        aCols.push({
          label: texts.getProperty("/CatagProd.Exc2"),
          type: EdmType.String,
          property: "Ltext",
        });
        aCols.push({
          label: texts.getProperty("/CatagProd.Exc3"),
          type: EdmType.String,
          property: "MatGrp",
        });
        aCols.push({
          label: texts.getProperty("/CatagProd.Exc14"),
          type: EdmType.String,
          property: "Wgbez",
        });

        aCols.push({
          label: texts.getProperty("/CatagProd.Exc1"),
          type: EdmType.String,
          property: "BrandDescr",
        });

        aCols.push({
          label: texts.getProperty("/CatagProd.Exc2"),
          type: EdmType.String,
          property: "BrandId",
        });
        aCols.push({
          label: texts.getProperty("/CatagProd.Exc3"),
          type: EdmType.String,
          property: "Dismm",
        });

        //****
        aCols.push({
          label: texts.getProperty("/CatagProd.Exc4"),
          type: EdmType.String,
          property: "Ean11",
        });

        aCols.push({
          label: texts.getProperty("/CatagProd.Exc5"),
          type: EdmType.String,
          property: "InfoRec",
        });

        aCols.push({
          label: texts.getProperty("/CatagProd.Exc7"),
          type: EdmType.String,
          property: "Maktx",
        });

        aCols.push({
          label: texts.getProperty("/CatagProd.Exc9"),
          type: EdmType.String,
          property: "Material",
        });

        aCols.push({
          label: texts.getProperty("/CatagProd.Exc11"),
          type: EdmType.String,
          property: "Node02",
        });

        aCols.push({
          label: texts.getProperty("/CatagProd.Exc12"),
          type: EdmType.String,
          property: "Vendor",
        });

        aCols.push({
          label: texts.getProperty("/CatagProd.Exc13"),
          type: EdmType.String,
          property: "Werks",
        });

        return aCols;
      },
      //exporta excel
      buildExportpiechart: function () {
        var aCols, aProducts, oSettings, oSheet;

        aCols = this.createColumnConfig();
        aProducts = this.getView().getModel("ModelTP").getData();
        console.log(aProducts);
        oSettings = {
          workbook: { columns: aCols },
          dataSource: aProducts,
          fileName: "prueba",
        };

        oSheet = new Spreadsheet(oSettings);
        oSheet
          .build()
          .then(function () {})
          .finally(oSheet.destroy);
      },

      DescargarLog:
        sap.m.Table.prototype.exportData ||
        function () {
          var oModel = this.getView().getModel("ModelTP");
          let texts = this.getOwnerComponent().getModel("appTxts");
          var Model = this.getView().getModel("configSite").getData();

          var Exc1 = {
            name: texts.getProperty("/CatagProd.Exc1"),
            template: {
              content: "{Node}",
            },
          };

          var Exc2 = {
            name: texts.getProperty("/CatagProd.Exc2"),
            template: {
              content: "{LtextSeg}",
            },
          };
          var Exc3 = {
            name: texts.getProperty("/CatagProd.Exc3"),
            template: {
              content: "{MatGrp}",
            },
          };
          var Exc4 = {
            name: texts.getProperty("/CatagProd.Exc4"),
            template: {
              content: "{Wgbez}",
            },
          };
          var Exc5 = {
            name: texts.getProperty("/CatagProd.Exc5"),
            template: {
              content: "{NodeSeg}",
            },
          };
          var Exc6 = {
            name: texts.getProperty("/CatagProd.Exc6"),
            template: {
              content: "{Ltext}",
            },
          };
          var Exc7 = {
            name: texts.getProperty("/CatagProd.Exc7"),
            template: {
              content: "{BrandId}",
            },
          };
          var Exc8 = {
            name: texts.getProperty("/CatagProd.Exc8"),
            template: {
              content: "{BrandDescr}",
            },
          };
          var Exc9 = {
            name: texts.getProperty("/CatagProd.Exc9"),
            template: {
              content: "'{Ean11}",
            },
          };
          var Exc10 = {
            name: texts.getProperty("/CatagProd.Exc10"),
            template: {
              content: "{Maktx}",
            },
          };
          var Exc11 = {
            name: texts.getProperty("/CatagProd.Exc11"),
            template: {
              content: "{Werks}",
            },
          };
          var Exc12 = {
            name: texts.getProperty("/CatagProd.Exc12"),
            template: {
              content: "{Name1}",
            },
          };
          var Exc13 = {
            name: texts.getProperty("/CatagProd.Exc13"),
            template: {
              content: "{EkorgT001w}",
            },
          };
          var Exc14 = {
            name: texts.getProperty("/CatagProd.Exc14"),
            template: {
              content: "{EkorgEine}",
            },
          };
          var Exc15 = {
            name: texts.getProperty("/CatagProd.Exc15"),
            template: {
              content: "{Kbetr}",
            },
          };
          var Exc16 = {
            name: texts.getProperty("/CatagProd.Exc16"),
            template: {
              content: "{Konwa}",
            },
          };
          var Exc17 = {
            name: texts.getProperty("/CatagProd.Exc17"),
            template: {
              content: "{KbetrDto1}",
            },
          };
          var Exc18 = {
            name: texts.getProperty("/CatagProd.Exc18"),
            template: {
              content: "{KbetrDto2}",
            },
          };
          var Exc19 = {
            name: texts.getProperty("/CatagProd.Exc19"),
            template: {
              content: "{KbetrDto3}",
            },
          };
          var Exc20 = {
            name: texts.getProperty("/CatagProd.Exc20"),
            template: {
              content: "{KbetrDto4}",
            },
          };
          var Exc21 = {
            name: texts.getProperty("/CatagProd.Exc21"),
            template: {
              content: "{KbetrDtoad}",
            },
          };
          var Exc22 = {
            name: texts.getProperty("/CatagProd.Exc22"),
            template: {
              content: "{Bonificacion}",
            },
          };
          var Exc23 = {
            name: texts.getProperty("/CatagProd.Exc23"),
            template: {
              content: "{KbetrCargo}",
            },
          };
          var Exc24 = {
            name: texts.getProperty("/CatagProd.Exc24"),
            template: {
              content: "{Netpr}",
            },
          };
          var Exc25 = {
            name: texts.getProperty("/CatagProd.Exc25"),
            template: {
              content: "{Umrez}",
            },
          };
          var Exc26 = {
            name: texts.getProperty("/CatagProd.Exc26"),
            template: {
              content: "{Meins}",
            },
          };
          var Exc27 = {
            name: texts.getProperty("/CatagProd.Exc27"),
            template: {
              content: "'{Ean11Codemp}",
            },
          };
          var Exc28 = {
            name: texts.getProperty("/CatagProd.Exc28"),
            template: {
              content: "{KbetrCtoUni}",
            },
          };
          var Exc29 = {
            name: texts.getProperty("/CatagProd.Exc29"),
            template: {
              content: "{Zterm}",
            },
          };
          var Exc30 = {
            name: texts.getProperty("/CatagProd.Exc30"),
            template: {
              content: "{Text1}",
            },
          };
          var Exc31 = {
            name: texts.getProperty("/CatagProd.Exc31"),
            template: {
              content: "{Dismm}",
            },
          };
          var Exc32 = {
            name: texts.getProperty("/CatagProd.Exc32"),
            template: {
              content: "{Dibez}",
            },
          };
          var Exc33 = {
            name: texts.getProperty("/CatagProd.Exc33"),
            template: {
              content: "{Bwscl}",
            },
          };

          var Exc34 = {
            name: texts.getProperty("/CatagProd.Exc34"),
            template: {
              content: "{BwsclDesc}",
            },
          };

          var oExport = new Export({
            exportType: new ExportTypeCSV({
              fileExtension: "csv",
              separatorChar: ";",
            }),

            models: oModel,

            rows: {
              path: "/",
            },
            columns: [
              Exc1,
              Exc2,
              Exc3,
              Exc4,
              Exc5,
              Exc6,
              Exc7,
              Exc8,
              Exc9,
              Exc10,
              Exc11,
              Exc12,
              Exc13,
              Exc14,
              Exc15,
              Exc16,
              Exc17,
              Exc18,
              Exc19,
              Exc20,
              Exc21,
              Exc22,
              Exc23,
              Exc24,
              Exc25,
              Exc26,
              Exc27,
              Exc28,
              Exc29,
              Exc30,
              Exc31,
              Exc32,
              Exc33,
              Exc34,
            ],
          });
          var Name = Model.supplierInputKey;
          if (this.getView().byId("FDivision").getSelectedKey() !== "") {
            Name = Name + "-" + this.getView().byId("FDivision").getValue();
          }
          if (this.getView().byId("Fsurtido").getSelectedKey() !== "") {
            Name = Name + "-" + this.getView().byId("Fsurtido").getValue();
          }
          if (this.getView().byId("Ftienda").getSelectedKey() !== "") {
            Name = Name + "-" + this.getView().byId("Ftienda").getValue();
          }
          if (this.getView().byId("SKU").getValue() !== "") {
            Name = Name + "-" + this.getView().byId("SKU").getValue();
          }

          oExport
            .saveFile(Name)
            .catch(function (oError) {})
            .then(function () {
              oExport.destroy();
              //console.log("esto es una maravilla");
            });
        },
    });
  }
);
