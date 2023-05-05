sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
    "use strict";

    var oModel = new this.Acuerdos();

    return Controller.extend("demo.controllers.AcuerdosNser.Master", {
        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getOwnerComponent().getModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new JSONModel(), "AcuerdosNserHdr");
                    this.clearFilters();
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },
        searchData: function () {
            var bContinue = true;

            if (!oModel.getModel()) {
                oModel.initModel();
            }

            var proveedor = this.getConfigModel().getProperty("/supplierInputKey");
            var documento = this.getView().byId('documentoInput').getValue();
            var convenio = this.getView().byId('convenioInput').getValue();
            var centro = this.getView().byId('centroInput').getValue();
            var texts = this.getOwnerComponent().getModel("appTxts");

            if (proveedor == "" || proveedor == null) {
                MessageBox.error(texts.getProperty("/acuerdosNser.indProv"));
                bContinue = false;
            } else if (documento == "" || documento == null) {
                MessageBox.error(texts.getProperty("/acuerdosNser.indDocto"));
                bContinue = false;
            }

            if (bContinue) {

                var url = "AcuerdosNserSet?$filter=Lifnr eq '" + proveedor + "'";

                if (documento != "" && documento != null) {
                    url += " and Belnr eq '" + documento + "'";
                }

                if (convenio != "" && convenio != null) {
                    url += " and Conve eq '" + convenio + "'";
                }

                if (centro != "" && centro != null) {
                    url += " and Werks eq '" + centro + "'";
                }

                this.getView().byId('tableAcuerdosNser').setBusy(true);
                oModel.getJsonModelAsync(
                    url,
                    function (jsonModel, parent) {
                        var objResponse = jsonModel.getProperty("/results");

                        if (objResponse != null) {

                            var totCanti = objResponse.reduce((a, b) => +a + (+b["Canti"] || 0), 0);
                            var totPvmat = objResponse.reduce((a, b) => +a + (+b["Pvmat"] || 0), 0);
                            var totCumat = objResponse.reduce((a, b) => +a + (+b["Cumat"] || 0), 0);
                            var totCargo = objResponse.reduce((a, b) => +a + (+b["Cargo"] || 0), 0);
                            var totIva = objResponse.reduce((a, b) => +a + (+b["Iva"] || 0), 0);
                            var totIeps = objResponse.reduce((a, b) => +a + (+b["Ieps"] || 0), 0);
                            var totTotca = objResponse.reduce((a, b) => +a + (+b["Totca"] || 0), 0);

                            var totalAcuNser = {
                                "TotCanti": Number(totCanti.toFixed(2)),
                                "TotPvmat": Number(totPvmat.toFixed(2)),
                                "TotCumat": Number(totCumat.toFixed(2)),
                                "TotCargo": Number(totCargo.toFixed(2)),
                                "TotIva": Number(totIva.toFixed(2)),
                                "TotIeps": Number(totIeps.toFixed(2)),
                                "TotTotca": Number(totTotca.toFixed(2))
                            };

                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(totalAcuNser), 
                                "AcuerdosNserTot");

                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse),
                                "AcuerdosNserHdr");

                            ///parent.paginate("tableAcuerdosNser", "/AportaDet", 1, 0);
                        }
                        parent.getView().byId('tableAcuerdosNser').setBusy(false);
                    },
                    function (parent) {
                        parent.getView().byId('tableAcuerdosNser').setBusy(false);
                    },
                    this
                );
            }

        },
        clearFilters: function () {
            this.getView().byId("supplierInput").setValue("");
            this.getView().byId("documentoInput").setValue("");
            this.getView().byId("convenioInput").setValue("");
            this.getView().byId("centroInput").setValue("");
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                    name: texts.getProperty("/acuerdosNser.proveedor"),
                    template: {
                        content: "{Lifnr}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNser.documento"),
                    template: {
                        content: "{Belnr}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNser.convenio"),
                    template: {
                        content: "{Conve}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNser.centro"),
                    template: {
                        content: "{Werks}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNser.pedido"),
                    template: {
                        content: "{Ebeln}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNser.material"),
                    template: {
                        content: "{Matnr}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNser.descMat"),
                    template: {
                        content: "{Maktx}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNser.cantidad"),
                    template: {
                        content: "{Canti}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNser.pvMat"),
                    template: {
                        content: "{Pvmat}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNser.cuMat"),
                    template: {
                        content: "{Cumat}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNser.cargo"),
                    template: {
                        content: "{Cargo}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNser.iva"),
                    template: {
                        content: "{Iva}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNser.ieps"),
                    template: {
                        content: "{Ieps}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNser.totCargo"),
                    template: {
                        content: "{Totca}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosNser.fecCargo"),
                    template: {
                        content: "{ path: 'Fecca', type: 'sap.ui.model.type.DateTime', formatOptions: { pattern: 'dd/MM/yyyy', UTC: true } }"
                    }
                }
            ];

            this.exportxls('AcuerdosNserHdr', '/', columns);
        }
    });
});