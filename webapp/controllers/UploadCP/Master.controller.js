sap.ui.define([
    "demo/controllers/BaseController"
], function (Controller) {
    "use strict";

    var oCartaPorte = new this.CartaPorte();
    var oFilesCartaPorte = new this.FilesCartaPorte();

    return Controller.extend("demo.controllers.UploadCP.Master", {

        oFileUploader: undefined,
        cboxComboBoxDet: undefined,
        cboxTipoOper: undefined,
        inputFolio: undefined,

        onInit: function () {
            this.configFilterLanguage(this.getView().byId("filterBar"));
            this.onLoadCedis();
            this.onLoadTipoOperacion();
            this.oFileUploader = this.getView().byId("fuTxt");
            this.cboxComboBoxDet = this.getView().byId("UCPComboBoxDet");
            this.cboxTipoOper = this.getView().byId("UCPComboBoxOp");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("masterUploadCP").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
			this._clearInputs();
		},

        onExit: function () {
            that._clearInputs();
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

        cpUploadPress: function () {
            let that = this;
            let lifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var file = this.oFileUploader.oFileUpload.files[0];
            let determinante = this.cboxComboBoxDet.getSelectedKey();
            let tipoOperacion = this.cboxTipoOper.getSelectedKey();

            if (determinante == "" || tipoOperacion == "" || lifnr == undefined || file == undefined) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty("/cartaPorte.uploadMissingDataError"));
            } else {
                sap.ui.core.BusyIndicator.show(0);
                const form = new FormData();
                form.append("IdsNumUn", determinante);
                form.append("TipoOperacion", tipoOperacion);
                form.append("provid", lifnr);
                form.append("folio", "20");
                form.append("BControlCargar", "enviar");
                form.append("archivoCartaPorte", file);

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
                        if (response !== "") {
                            sap.m.MessageBox.error(response);
                        } else {
                            sap.m.MessageBox.success(that.getOwnerComponent().getModel("appTxts").getProperty("/cartaPorte.uploadSuccess"));
                            that._clearInputs();
                        }
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/cartaPorte.uploadError"));
                        that._clearInputs();
                    }
                });
            }
        },

        _clearInputs() {
            this.cboxComboBoxDet.setSelectedKey(null);
            this.cboxTipoOper.setSelectedKey(null);
            this.oFileUploader.clear();
        }
    });
});