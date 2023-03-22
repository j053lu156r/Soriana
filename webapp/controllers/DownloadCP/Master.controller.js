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

        onLoadCedis: function(){
            var body = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' + 
                        'xmlns:xsd="http://www.w3.org/2001/XMLSchema"' + 
                        'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' + 
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
                success: function (response) {
                    console.log(response)
                },
                error: function (request, status, err) {
                    console.log(request)
                    console.log(status)
                    console.log(err)
                }
            });
        },

        onLoadTipoOperacion: function(){
            var body = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' + 
                        'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' + 
                        'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' + 
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
                success: function (response) {
                    console.log(response)
                },
                error: function (request, status, err) {
                    console.log(request)
                    console.log(status)
                    console.log(err)
                }
            });
        }
    });
});