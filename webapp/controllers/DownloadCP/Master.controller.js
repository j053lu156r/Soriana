sap.ui.define([
    "demo/controllers/BaseController"
], function (Controller) {
    "use strict";

    var oCartaPorte = new this.CartaPorte();
    var oFilesCartaPorte = new this.FilesCartaPorte();

    return Controller.extend("demo.controllers.DownloadCP.Master", {

        cboxComboBoxDet: undefined,
        cboxTipoOper: undefined,
        inputFolio: undefined,

        onInit: function () {
            this.configFilterLanguage(this.getView().byId("filterBar"));
            this.onLoadCedis();
            this.onLoadTipoOperacion();
            this.cboxComboBoxDet = this.getView().byId("DCPComboBoxDet");
            this.cboxTipoOper = this.getView().byId("DCPComboBoxOp");
            this.inputFolio = this.getView().byId("DCPinputFolio");
        },

        onExit: function () {

        },

        onLoadCedis: function () {
            const that = this;
            const s = new XMLSerializer();
            var body = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                'xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                '<soap:Body>' +
                '<GetCedis xmlns="http://tempuri.org/" />' +
                '</soap:Body>' +
                '</soap:Envelope>';
            $.ajax({
                async: true,
                url: oCartaPorte.sUrl,
                method: "POST",
                headers: {
                    "Content-Type": "text/xml; charset=utf-8",
                    "Access-Control-Allow-Origin": "*"
                },
                data: body,
                success: async function (response) {
                    const strXml = s.serializeToString(response.getElementsByTagName("GetCedisResult")[0]);
                    let json = xml2js(strXml, { compact: true })
                    let dataCedis = json.GetCedisResult;
                    dataCedis.Cedis = await that._formatDataCedis(dataCedis.Cedis);
                    var oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData(dataCedis);
                    that.getOwnerComponent().setModel(oModel, "CedisModel");
                },
                error: function (request, status, err) {
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/cartaPorte.missingCedisError"));
                }
            });
        },

        onLoadTipoOperacion: function () {
            const that = this;
            const s = new XMLSerializer();
            var body = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                'xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                '<soap:Body>' +
                '<GetTipoOper xmlns="http://tempuri.org/" />' +
                '</soap:Body>' +
                '</soap:Envelope>';

            $.ajax({
                async: true,
                url: oCartaPorte.sUrl,
                method: "POST",
                headers: {
                    "Content-Type": "text/xml; charset=utf-8",
                    "Access-Control-Allow-Origin": "*"
                },
                data: body,
                success: async function (response) {
                    const strXml = s.serializeToString(response.getElementsByTagName("GetTipoOperResult")[0]);
                    let json = xml2js(strXml, { compact: true })
                    let dataTipos = json.GetTipoOperResult;
                    dataTipos.TipoOperacion = await that._formatDataTipoOper(dataTipos.TipoOperacion);
                    var oModel = new sap.ui.model.json.JSONModel();
                    oModel.setData(dataTipos);
                    that.getOwnerComponent().setModel(oModel, "TipoOperModel");
                },
                error: function (request, status, err) {
                    sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/cartaPorte.missingTipoOperError"));
                }
            });
        },

        async _formatDataCedis(dataCedis) {
            await dataCedis.forEach(function (object, index) {
                let cedis = {
                    Id_Num_UN: 0,
                    Ids_Num_UN: 0,
                    Desc_UN: ""
                };
                cedis.Id_Num_UN = object.Id_Num_UN._text;
                cedis.Ids_Num_UN = object.Ids_Num_UN._text;
                cedis.Desc_UN = object.Desc_UN._text;
                dataCedis[index] = cedis;
            });
            return dataCedis;
        },

        async _formatDataTipoOper(dataTipos) {
            await dataTipos.forEach(function (object, index) {
                let tipo = {
                    Id_Num_TipoOper: 0,
                    Desc_TipoOper: ""
                };
                tipo.Id_Num_TipoOper = object.Id_Num_TipoOper._text;
                tipo.Desc_TipoOper = object.Desc_TipoOper._text;
                dataTipos[index] = tipo;
            });
            return dataTipos;
        },

        onDownload: function () {
            let that = this;
            let lifnr = this.getConfigModel().getProperty("/supplierInputKey");
            let determinante = this.cboxComboBoxDet.getSelectedKey();
            let tipoOperacion = this.cboxTipoOper.getSelectedKey();
            let folio = this.inputFolio.getValue();
            let textDet = this.cboxComboBoxDet.getSelectedItem().getText();
            let textTipo = this.cboxTipoOper.getSelectedItem().getText();

            if (determinante == "" || tipoOperacion == "" || folio == "" || lifnr == undefined) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/cartaPorte.missingDataError"));
            } else {
                sap.ui.core.BusyIndicator.show(0);
                const form = new FormData();
                form.append("IdsNumUn", determinante);
                form.append("TipoOperacion", tipoOperacion);
                form.append("provid", lifnr);
                form.append("folio", folio);
                form.append("BControlDescargar", "bajar");

                $.ajax({
                    async: true,
                    url: oFilesCartaPorte.sUrl,
                    method: "POST",
                    headers: {
                        "Access-Control-Allow-Origin": "*"
                    },
                    processData: false,
                    contentType: false,
                    mimeType: "multipart/form-data",
                    data: form,
                    success: function (response) {
                        sap.ui.core.BusyIndicator.hide();
                        if(response !== "") {
                            var blob = new Blob([response],{ type: "text/plain;charset=utf-8" });
                            saveAs(blob, `${textTipo}_${textDet}_${lifnr}_${folio}.txt`);
                        } else {
                            sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/cartaPorte.emptyFile"));
                        }
                    },
                    error: function (request, status, err) {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/cartaPorte.downloadError"));
                    }
                });
            }
        }
    });
});