sap.ui.define([
    "demo/controllers/BaseController"
], function (Controller) {
    "use strict";

    var oCartaPorte = new this.CartaPorte();

    return Controller.extend("demo.controllers.DownloadCP.Master", {
        onInit: function () {
            this.configFilterLanguage(this.getView().byId("filterBar"));
            this.onLoadCedis();
            this.onLoadTipoOperacion();
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
                    console.log(request)
                    console.log(status)
                    console.log(err)
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
                    //console.log(request)
                    //console.log(status)
                    //console.log(err)
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
        }
    });
});