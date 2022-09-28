sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
    "use strict";

    var oModel = new this.Acuerdos();

    return Controller.extend("demo.controllers.AcuerdosGral.Master", {
        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getOwnerComponent().getModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new JSONModel(), "AcuerdosGralHdr");
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
                MessageBox.error(texts.getProperty("/acuerdosGral.indProv"));
                bContinue = false;
            } else if (documento == "" || documento == null) {
                MessageBox.error(texts.getProperty("/acuerdosGral.indDocto"));
                bContinue = false;
            }

            if (bContinue) {

                var url = "AcuerdosGralSet?$filter=Lifnr eq '" + proveedor + "'";

                if (documento != "" && documento != null) {
                    url += " and Belnr eq '" + documento + "'";
                }

                if (convenio != "" && convenio != null) {
                    url += " and Conve eq '" + convenio + "'";
                }

                if (centro != "" && centro != null) {
                    url += " and Werks eq '" + centro + "'";
                }

                this.getView().byId('tableAcuerdosGral').setBusy(true);
                oModel.getJsonModelAsync(
                    url,
                    function (jsonModel, parent) {
                        var objResponse = jsonModel.getProperty("/results");

                        if (objResponse != null) {
                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse),
                                "AcuerdosGralHdr");

                            ///parent.paginate("tableAcuerdosGral", "/AportaDet", 1, 0);
                        }
                        parent.getView().byId('tableAcuerdosGral').setBusy(false);
                    },
                    function (parent) {
                        parent.getView().byId('tableAcuerdosGral').setBusy(false);
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
                    name: texts.getProperty("/acuerdosGral.proveedor"),
                    template: {
                        content: "{Lifnr}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosGral.documento"),
                    template: {
                        content: "{Belnr}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosGral.convenio"),
                    template: {
                        content: "{Conve}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosGral.centro"),
                    template: {
                        content: "{Werks}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosGral.folio"),
                    template: {
                        content: "{Folio}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosGral.base"),
                    template: {
                        content: "{Base}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosGral.descto"),
                    template: {
                        content: "{Desct}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosGral.iva"),
                    template: {
                        content: "{Iva}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosGral.ieps"),
                    template: {
                        content: "{Ieps}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosGral.pDescto"),
                    template: {
                        content: "{Prdes}"
                    }
                },
                {
                    name: texts.getProperty("/acuerdosGral.fecCargo"),
                    template: {
                        content: "{ path: 'Fecca', type: 'sap.ui.model.type.DateTime', formatOptions: { pattern: 'dd/MM/yyyy', UTC: true } }"
                    }
                }
            ];

            this.exportxls('AcuerdosGralHdr', '/', columns);
        }
    });
});