sap.ui.define([
    "demo/controllers/BaseController",
    "sap/m/MessageBox"
], function (Controller, MessageBox) {
    "use strict";

    var oModel = new this.Acuerdos();
    return Controller.extend("demo.controllers.AcuerdosHNS.Master", {
        onInit: function () {

            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getOwnerComponent().getModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "AcuerdosHdrHNS");
                    this.clearFilters();
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },
        searchData: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var bContinue = true;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var proveedor = this.getConfigModel().getProperty("/supplierInputKey");
            var referencia = this.getView().byId('referenciaInput').getValue();

            if ( proveedor == "" || proveedor == null ) {
                MessageBox.error(texts.getProperty("/acuerdosHNS.indProveedor"));
                bContinue = false;
            } else if ( referencia == "" || referencia == null ) {
                MessageBox.error(texts.getProperty("/acuerdosHNS.indReferencia"));
                bContinue = false;
            }

            if (bContinue) {

                var url = "AcuerdosHNSSet?$filter=";
                    url += "Lifnr eq '" + proveedor + "'";
                    url += " and Refer eq '" + referencia + "'";

                this.getView().byId('tableAcuerdosHNS').setBusy(true);
                oModel.getJsonModelAsync(
                    url,
                    function (jsonModel, parent) {
                        var objResponse = jsonModel.getProperty("/results");

                        if (objResponse != null) {

                            var totCanti = objResponse.reduce((a, b) => +a + (+b["Canti"] || 0), 0);
                            var totCnorm = objResponse.reduce((a, b) => +a + (+b["Cnorm"] || 0), 0);
                            var totCofer = objResponse.reduce((a, b) => +a + (+b["Cofer"] || 0), 0);
                            var totDifer = objResponse.reduce((a, b) => +a + (+b["Difer"] || 0), 0);
                            var totBonif = objResponse.reduce((a, b) => +a + (+b["Bonif"] || 0), 0);
                            var totImpieps = objResponse.reduce((a, b) => +a + (+b["Impieps"] || 0), 0);
                            var totIva = objResponse.reduce((a, b) => +a + (+b["Iva"] || 0), 0);

                            var totalAcuHNS = {
                                "TotCanti": Number(totCanti.toFixed(4)),
                                "TotCnorm": Number(totCnorm.toFixed(4)),
                                "TotCofer": Number(totCofer.toFixed(4)),
                                "TotDifer": Number(totDifer.toFixed(4)),
                                "TotBonif": Number(totBonif.toFixed(4)),
                                "TotImpieps": Number(totImpieps.toFixed(4)),
                                "TotIva": Number(totIva.toFixed(4))
                            };

                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(totalAcuHNS), 
                                "acuTotHNSModel");

                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse),
                                "AcuerdosHdrHNS");

                            //parent.paginate("AcuerdosHdr", "/AcuerdosDet", 1, 0);
                        }
                        parent.getView().byId('tableAcuerdosHNS').setBusy(false);
                    },
                    function (parent) {
                        parent.getView().byId('tableAcuerdosHNS').setBusy(false);
                    },
                    this
                );
            }

        },

        clearFilters : function(){

            this.getView().byId("referenciaInput").setValue("");
            var oModelHdr = this.getOwnerComponent().getModel("AcuerdosHdrHNS");
            if (oModelHdr) {
                oModelHdr.setData([]);
            }
            var oModelTot = this.getOwnerComponent().getModel("acuTotHNSModel");
            if (oModelTot) {
                oModelTot.setData([]);
            }
        },

        buildExportTable: function () {            

            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                 {
                    name: texts.getProperty("/acuerdosHNS.centro"),
                    template: {
                        content: "{Werks}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosHNS.canti"),
                    template: {
                        content: "{Canti}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosHNS.cNorm"),
                    template: {
                        content: "{Cnorm}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosHNS.cOfer"),
                    template: {
                        content: "{Cofer}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosHNS.difer"),
                    template: {
                        content: "{Difer}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosHNS.bonif"),
                    template: {
                        content: "{Bonif}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosHNS.ieps"),
                    template: {
                        content: "{Impieps}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosHNS.iva"),
                    template: {
                        content: "{Iva}"
                    }
                }
            ];

            this.exportxls('AcuerdosHdrHNS', '/', columns);
        },

        onListItemPress: function (oEvent) {
            var resource = oEvent.getSource().getBindingContext("AcuerdosHdrHNS").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("AcuerdosHdrHNS");
            var results = odata.getProperty("/");

            var docResult = results[line];
            
            var proveedor = this.getConfigModel().getProperty("/supplierInputKey");
            var referencia = this.getView().byId('referenciaInput').getValue();

            if (referencia.includes("/")) {
                var ref1 = referencia.substring(0, referencia.indexOf("/"));
                var ref2 = referencia.split('/')[1];
            } else {
                ref1 = referencia;
                ref2 = "NOREF2";
            }

            this.getOwnerComponent().getRouter().navTo("detailAcuerdosHNS",
                {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    proveedor: proveedor,
                    ref1: ref1,
                    ref2: ref2,
                    centro: docResult.Werks

               }, true);

        }

    });
});