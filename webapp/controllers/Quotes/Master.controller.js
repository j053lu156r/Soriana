sap.ui.define([
    "demo/controllers/Quotes/wizards/WQuoteCreate",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/f/library',
    "sap/ui/table/RowAction",
    "sap/ui/table/RowActionItem",
    "sap/ui/table/RowSettings",
], function (Controller, JSONModel, fioriLibrary, RowAction, RowActionItem, RowSettings) {
    "use strict";

    var cModel2 = new this.Citas2();
    var _oDataModel = "ZOSP_CITAS_ADM_SRV";
    var _oDataEntity = "MainSet";

    return Controller.extend("demo.controllers.Quotes.Master", {

        onInit: function () {
            this.setInitialDates();
            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "quoteConfigModel");
            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "ActionCita");
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    this.getCatalogs();
                    // if (this.getView().getModel("appoinmentsCatalogs") == null) {
                    //     this.getCatalogs();
                    // }
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(),
                        "tableQuotesModel");

                    this.clearFilds();
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
            this.getConfigModel().setProperty("/updateFormatsSingle", "xls,xlsx");
        },

        setInitialDates() {
            let dateRange = this.getView().byId("quotedateRange");
            let todayDate = new Date();
            let firstDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
            let lastDay = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
            dateRange.setDateValue(firstDay);
            dateRange.setSecondDateValue(lastDay);
        },

        searchData: function () {

            if (!this.hasAccess(30)) {
                return
            }

            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(),
                "tableQuotesModel");

            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var vFolioIni = this.getView().byId("quoteFolioIniInput").getValue();
            var vFolioFin = this.getView().byId("quoteFolioFinInput").getValue();
            var vFechaRegCita = this.getView().byId("quotedateRange");

            //Fechas de entrega
            var vIniDate = this.buildSapDate(vFechaRegCita.getDateValue());
            var vEndDate = this.buildSapDate(vFechaRegCita.getSecondDateValue());

            //Validamos si el proveedor existe
            if (vLifnr == null
                || vLifnr == "") {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.noProvider"));
                return;
            }

            // Validamos si hay datos validos
            if ((vFolioIni == null || vFolioIni == "")
                && (vIniDate == null || vIniDate == "" && vEndDate == null || vEndDate == "")) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/quotes.noFolioDates"));
                return;
            }

            let filtros = [];

            filtros.push(new sap.ui.model.Filter({
                path: "Action",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: '1'
            })
            );

            filtros.push(new sap.ui.model.Filter({
                path: "Proveedor",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: vLifnr
            })
            );

            if (vFolioIni != null && vFolioIni != ""
                && vFolioFin != null && vFolioFin != "") {
                filtros.push(new sap.ui.model.Filter({
                    path: "Folioini",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: vFolioIni
                })
                );
                filtros.push(new sap.ui.model.Filter({
                    path: "Foliofin",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: vFolioFin
                })
                );
            }

            if (vIniDate != null && vIniDate != ""
                && vEndDate != null && vEndDate != "") {

                filtros.push(new sap.ui.model.Filter({
                    path: "Fechaini",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: vIniDate
                })
                );

                filtros.push(new sap.ui.model.Filter({
                    path: "Fechafin",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: vEndDate
                })
                );
            }

            sap.ui.core.BusyIndicator.show();
            let that = this;
            this._GetODataV2(_oDataModel, _oDataEntity, filtros, ["CTCITASCAB"], "").then(resp => {

                console.log(resp)
                console.log(this.getView().getModel("appoinmentsCatalogs").getData())
                that.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(resp.data.results[0]), "tableQuotesModel");
                that.paginate("tableQuotesModel", "/CTCITASCAB", 1, 0);
                sap.ui.core.BusyIndicator.hide();
            }).catch(error => {
                sap.ui.core.BusyIndicator.hide();
                console.error(error);
            });
        },
        searchDetail: function (dato) {

      

         

            let filtros = [];

            filtros.push(new sap.ui.model.Filter({
                path: "Action",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: '2'
            })
            );
            
            filtros.push(new sap.ui.model.Filter({
                path: "Folioini ",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: "'"+dato+"'"
            })
            );

           
            sap.ui.core.BusyIndicator.show();
            let that = this;
            this._GetODataV2(_oDataModel, _oDataEntity, filtros, ["CTCITASDETEXT"], "").then(resp => {

                console.log(resp.data.results[0].CTCITASDETEXT.results)
          //console.log(this.getView().getModel("appoinmentsCatalogs").getData())
                that.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(resp.data.results[0].CTCITASDETEXT.results), "PosicionesG");
              // that.paginate("tableQuotesModel", "/CTCITASCAB", 1, 0);
                sap.ui.core.BusyIndicator.hide();
            }).catch(error => {
                sap.ui.core.BusyIndicator.hide();
                console.error(error);
            });
        },


        clearFilds: function () {
            // this.getView().byId("quoteFolioInput").setValue("");
            this.getView().byId("dateRange").setDateValue("");
            this.getView().byId("quoteType").setValue("");
            this.getView().byId("quoteStatus").setValue("");
            this.getView().byId("quoteUnitType").setValue("");
            this.getView().byId("productType").setValue("");
            this.getView().byId("orderInput").setValue("");
            this.getView().byId("quoteTurn").setValue("");
            this.getView().byId("branchInput").setValue("");
        },
        getCatalogs: function () {
            var url = "/HeaderCITASSet?$expand=ETIPOCITANAV,ETIPOPRODUCTONAV,ETIPOTURNONAV,ETIPOUNIDADNAV,ETIPOSTATUSNAV&$filter=IOption eq '3'&$format=json";

            var catalogsModel = cModel2.getJsonModel(url);

            if (catalogsModel != null) {

                var response = catalogsModel.getProperty("/results/0");
                this.getView().setModel(new sap.ui.model.json.JSONModel(response), "appoinmentsCatalogs");

                var algo = this.getView().getModel("appoinmentsCatalogs");
            }
        },
        _brandValueHelpConfirm: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var productInput = this.byId("branchInput");
                productInput.setValue(`${oSelectedItem.getTitle()} - ${oSelectedItem.getDescription()}`);
            }
        },
        helpProductType: function (hasCreate) {

            if (this.getConfigModel().getProperty("/supplierInputKey")) {
                var oView = this.getView();

                if (!this._pTypeHelpDialog) {
                    this._pTypeHelpDialog = sap.ui.core.Fragment.load({
                        id: oView.getId(),
                        name: "demo.fragments.ProductTypeSelect",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }

                var url = `/HeaderCITASSet?$expand=ETIPOPRODUCTONAV&$filter=IOption eq '3' and IZproveedor eq '${this.getConfigModel().getProperty("/supplierInputKey")}'`;

                var response = cModel2.getJsonModel(url);

                if (response != null) {
                    var objResponse = response.getProperty("/results/0");
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), "searchProductType");
                }

                this._pTypeHelpDialog.hasCreate = hasCreate;

                this._pTypeHelpDialog.then(function (oDialog) {
                    oDialog.open();
                });
            } else {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/helpDocs.uploader.noProvider"));
            }
        },
        productTypeValueHelpSearch: function (oEvent) {
            var strSearch = oEvent.getParameter("value");

            if (strSearch != null && strSearch != "") {

            } else {
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "searchProductType");
            }
        },
        _productTypeValueHelpConfirm: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var productInput = null;
                if (this._pTypeHelpDialog.hasCreate) {
                    productInput = this.byId("productTypeC")
                } else {
                    productInput = this.byId("productType")
                };
                productInput.setValue(`${oSelectedItem.getTitle()}`);
            }
        },
        onAppointmentItemPress: function (oEvent) {
            var appointment = oEvent.getParameter("appointment");

            if (appointment != null) {

                var resource = appointment.getBindingContext("tableQuotesModel").getPath();
                var line = resource.split("/").slice(-1).pop();

                var odata = this.getOwnerComponent().getModel("tableQuotesModel");
                var results = odata.getProperty("/ECITASCONSNAV/Paginated/results");

                var document = results[line].ZfolioCita;
                /*var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
                this.getOwnerComponent().getRouter().navTo("detailOrders", { layout: oNextUIState, document: document }, true);*/
                this.getOwnerComponent().getRouter().navTo("detailQuotes", { layout: sap.f.LayoutType.MidColumnFullScreen, document: document }, true);
            }
        },
        Confirmacion:function(oEvent){
            var oSelectedItem = oEvent.getSource().getParent();
           
           
console.log("juan")



    sap.m.MessageBox["confirm"](
        this.getView().getModel("appTxts").getProperty("/quotes.confirmcitabtn"),{
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: async function (oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
                var json = {
                    Proveedor: oSelectedItem.getBindingContext("tableQuotesModel").getProperty("Proveedor"),
                    Action: "4",
                
                    CTCITASCAB: [
                      {
                        Folio: oSelectedItem.getBindingContext("tableQuotesModel").getProperty("Folio"),
                        Centro: oSelectedItem.getBindingContext("tableQuotesModel").getProperty("Centro"),
                        Fechacita: oSelectedItem.getBindingContext("tableQuotesModel").getProperty("Fechacita"),
                        Proveedor: oSelectedItem.getBindingContext("tableQuotesModel").getProperty("Proveedor"),
                      },
                    ],
                    CTCITASDET: [],
                    ETRETURN: [],
                  };
                
                  var model = "ZOSP_CITAS_ADM_SRV";
                  var entity = "/MainSet" ;
                  var json2 = JSON.stringify(json);
                  var that = this;
                
                  that._POSToData(model, entity, json2).then(function (_GEToDataV2Response) {
                      sap.ui.core.BusyIndicator.hide();
                
                      var response = _GEToDataV2Response.d;
                
                      if (response.Success === "X") {
                        sap.m.MessageBox.success(that.getView().getModel("appTxts").getProperty("/quotes.confirmcita"));
                      } else {
                        sap.m.MessageBox.error(response.ETRETURN.results[0].Message);
                      }
                
                     
                      that.searchData();
                    });
            }
          }.bind(this),
        }
      );



        },

        onListItemPress: function (oEvent) {
      var that =this;
            var modelo=that.getView().getModel("tableQuotesModel").getData()
            modelo=modelo.CTCITASCAB.results;
            console.log(modelo)
     
        var productPath = oEvent.getSource().getBindingContext("tableQuotesModel").getPath(),
        product = productPath.split("/").slice(-1).pop();
        console.log(product)
      console.log(modelo[product])
      that.searchDetail(modelo[product].Folio)
        modelo[product].lectura=true;
        modelo[product].Estilo='V';

       console.log(modelo[product])
      //  var  cmModel = new sap.ui.model.json.JSONModel(modelo[product]);
        that.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(modelo[product]),
        "ModelLectura");
       // that.getOwnerComponent().setModel(cmModel, "ModelLectura");
        //that.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel({editable: false,}), "Modeleditable");
        that.createQuote(modelo[product])

       
        },

        formatDateQuote: function (v) {
            if (v) {
                jQuery.sap.require("sap.ui.core.format.DateFormat");
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "yyyy-MM-dd"
                });

                var tmpDate = new Date(v);
                tmpDate.setDate(tmpDate.getDate() + 1);
                return tmpDate;
            } else {
                return null;
            }
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");

            var columns = [
                {
                    name: texts.getProperty("/quotes.branch"),
                    template: {
                        content: "{Zsucursal}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.branch"),
                    template: {
                        content: "{Zdescrsucursal}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.quoteFolio"),
                    template: {
                        content: "{ZfolioCita}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.quoteDate"),
                    template: {
                        content: "{Zfecharegcita}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.quoteType"),
                    template: {
                        content: "{ZtipoCita}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.quoteStatus"),
                    template: {
                        content: "{Zstatus}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.productType"),
                    template: {
                        content: "{ZtipoProd}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.unitType"),
                    template: {
                        content: "{ZtipoUnidad}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.turn"),
                    template: {
                        content: "{Zturno}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.turn"),
                    template: {
                        content: "{ZTipoturno}"
                    }
                }
            ];

            this.exportxls('tableQuotesModel', '/ECITASCONSNAV/results', columns);
        },
        openUploadDialog: function () {
            if (!this._uploadDialog) {
                this._uploadDialog = sap.ui.xmlfragment("demo.views.Quotes.UploadQuote", this);
                this.getView().addDependent(this._uploadDialog);
            }
            this._uploadDialog.open();
        },
        onCloseDialogUpload: function () {
            if (this._uploadDialog) {
                this._uploadDialog.destroy();
                this._uploadDialog = null;
            }
        },
        btnValidateFile: function () {
            console.log("Upload file");
        }
    });
});