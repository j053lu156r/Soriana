sap.ui.define([
    'sap/m/library',
    "sap/ui/thirdparty/jquery",
    "sap/m/MessageBox",
    "demo/controllers/BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/base/Log",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (mobileLibrary, jQuery, MessageBox, Controller, Log, JSONModel, Device) {
    "use strict";

    var URLHelper = mobileLibrary.URLHelper;
    var inboxModel = new this.MyInbox();
    return Controller.extend("demo.controllers.MiBandeja.Master", {

        onInit: function () {
            /*var oDeviceModel = new sap.ui.model.json.JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.getView().setModel(oDeviceModel, "device");*/

            this._pdfViewer = new sap.m.PDFViewer();
            this.getView().addDependent(this._pdfViewer);

            this.getView().addEventDelegate({
                onBeforeShow: function () {
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "tableInbox");
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "tableLocations");
                    this.clearFilters();
                },
                onAfterShow: function (oEvent) {
                    this.getOwnerComponent().getModel("configSite").setProperty("/barVisible", true);
                    this.getInbox();
                }
            }, this);

            var oGeoMap = this.getView().byId("GeoMap");
            var oMapConfig = {
                "MapProvider": [
                    {
                        "Id": "base",
                        "name": "Base",
                        "tileX": "512",
                        "tileY": "512",
                        "minLOD": "1",
                        "maxLOD": "19",
                        "copyright": "Google",
                        "Source": [
                            {
                                "id": "a",
                                "url": "https://mt1.google.com/vt/lyrs=r&style=2&x={X}&y={Y}&z={LOD}"
                            }
                        ]
                    }
                ],
                "MapLayerStacks": [
                    {
                        "name": "Default",
                        "MapLayer": [
                            {
                                "name": "Default",
                                "refMapProvider": "Base",
                                "opacity": "1.0"
                            }
                        ],
                        "colBkgnd": "rgb(0,0,0)"
                    }
                ]
            };
            oGeoMap.setMapConfiguration(oMapConfig);
            oGeoMap.setRefMapLayerStack("Default");
            oGeoMap.setInitialZoom(17);
        },
        searchData: function(){
            var detViewId = this.getSplitContObj().getCurrentPage(false).sId;

            var detViewIdMin = detViewId.replace(`${this.getView().sId}--`, "");

            switch ( detViewIdMin ){
                case "locations":
                    this.doSearchLocation(this.getView().byId("searchLocation").getValue());
                    break;
                case "detailDetail":
                    this.getHelpDocs();
                    break;
                case "inbox":
                    this.doSearchRelease(this.getView().byId("releaseSearch").getValue());
                    break;
            }
        },
        onPressNavToDetail: function () {
            this.getSplitContObj().to(this.createId("detailDetail"));
            this.getHelpDocs();
        },

        onPressNotices: function () {
            sap.m.MessageBox.success("test");
        },

        onPressMasterBack: function () {
            this.getSplitContObj().backMaster();
        },

        onPressGoToMaster: function () {
            this.getSplitContObj().toDetail(this.createId("inbox"));
            this.getInbox();
        },
        onPressGoToMasterLocations: function () {
            this.getSplitContObj().toDetail(this.createId("locations"));
        },
        onListItemPress: function (oEvent) {
            var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();

            this.getSplitContObj().toDetail(this.createId(sToPageId));
            this.buildView(sToPageId);
        },
        lon2tile: function (lon, zoom) {
            var vReturn = (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
            vReturn;
        },
        lat2tile: function (lat, zoom) {
            var vReturn = (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
            vReturn;
        },
        selectRelease: function (oEvent) {
            var property = oEvent.getSource().getBindingContext("tableInbox").getPath();
            var vMail = this.getOwnerComponent().getModel("userdata").getProperty("/IMail");

            var odata = this.getOwnerComponent().getModel("tableInbox");
            var result = odata.getProperty(property);

            var response = inboxModel
                .getJsonModel("/headInboxSet?$expand=ETATTACHNAV&$filter=IOption eq '4'"
                    + " and IMail eq '" + vMail + "'"
                    + " and IIdmen eq '" + result.Idmensaje + "'");

            if (response != null) {
                var objResponse = response.getProperty("/results/0");
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), "release");
            }

            this.getSplitContObj().toDetail(this.createId("releaseDetail"));
        },
        buildView: function (pageId) {
            switch (pageId) {
                case "inbox":
                    this.getInbox();
                    break;
                case "detailDetail":
                    this.getHelpDocs();
                    break;
            }
        },
        getInbox: async function () {
            var sField = this.getView().byId("releaseSearch");
            if(sField != null && sField.getValue() != ""){
                return;
            }
            var vMail = this.getOwnerComponent().getModel("userdata").getProperty("/IMail");
            this.getView().byId('complPagoList').setBusy(true);

            var response = inboxModel.getJsonModelAsync(
                `/headInboxSet?$expand=ETINBOXUNAV&$filter=IOption eq '2' and IMail eq '${vMail}'`,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results/0");

                    if (objResponse != null) {
                        parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), "tableInbox");

                        parent.paginated("tableInbox", "/ETINBOXUNAV", 1, 0);
                    }
                    parent.getView().byId('complPagoList').setBusy(false);

                    parent.inboxMetric();
                },
                function (parent) {
                    parent.getView().byId('complPagoList').setBusy(false);
                },
                this
            );
        },
        getHelpDocs: function () {
            var search = this.getView().byId("helpDocSearch").getValue();
            this.getView().byId('helpDocsList').setBusy(true);

            var url = "/headInboxSet?$expand=ETDOCANAV&$filter= IOption eq '10'";

            if (search != null && search != "") {
                url += ` and IName eq '${search}'`;
            }

            inboxModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/results/0");

                    if (objResponse != null) {
                        parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), "tableHelpDocs");

                        parent.paginated("tableHelpDocs", "/ETDOCANAV", 1, 0);
                    }
                    parent.getView().byId('helpDocsList').setBusy(false);
                },
                function (parent) {
                    parent.getView().byId('helpDocsList').setBusy(false);
                },
                this
            );
        },
        selectHelpDoc: function (docInv) {
            var response = inboxModel.getJsonModel(`/headInboxSet?$expand=ETDOCANAV&$filter= IOption eq '11' and IIdhp eq '${docInv}'`);

            if (response != null) {
                var result = response.getProperty("/results/0");
                if (result.ESuccess == "X") {
                    this.downloadAttach(result.EsVdoca.Zdocvalue64, result.EsVdoca.Zdoctype);
                } else {
                    sap.m.MessageBox.error(result.EMessage);
                }
            }
        },
        searchLocation: function (oEvent) {
            var strSearch = oEvent.getSource().getValue();
            this.doSearchLocation(strSearch);
        },
        doSearchLocation: function(strSearch){
            if (strSearch != null && strSearch != "") {
                var response = inboxModel.getJsonModel("/headInboxSet?$expand=ETSTORENAV&$filter= IOption eq '14' and IName eq '" + strSearch + "'");

                if (response != null) {
                    var objResponse = response.getProperty("/results/0");
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), "tableLocations");

                    this.paginated("tableLocations", "/ETSTORENAV", 1, 0);
                }
            } else {
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "tableLocations");
            }
        },
        onPressLocation: function (oEvent) {
            var item = oEvent.getSource().getBindingContext("tableLocations").getPath();
            var odata = this.getOwnerComponent().getModel("tableLocations");
            var result = odata.getProperty(item);

            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(result), "detailLocation");

            var oGeoMap = this.getView().byId("GeoMap");
            if (result.Zlatitud != null && result.Zlatitud != "" && result.Zlongitud != null && result.Zlongitud != "") {
                oGeoMap.setCenterPosition(result.Zlongitud + ";" + result.Zlatitud);
                oGeoMap.setVisible(true);
            } else {
                oGeoMap.setVisible(false);
            }

            this.getSplitContObj().toDetail(this.createId("locantionsDetail"));
        },

        getSplitContObj: function () {
            var result = this.byId("SplitContDemo");
            if (!result) {
                Log.error("SplitApp object can't be found");
            }
            return result;
        },
        paginated: function (model, table, iterator, row) {
            this.paginate(model, table, iterator, row);
        },
        handleUrlMap: function (latitud, longitud) {
            var url = "https://www.google.com.mx/maps/@" + longitud + "," + latitud + ",19z";
            URLHelper.redirect(url, true);
        },
        hasMap: function (longitud, latitud) {
            return (longitud != null && longitud != "" && latitud != null && latitud != "");
        },
        editMap: function (longitud, latitud) {
            var rol = this.getOwnerComponent().getModel("userdata").getProperty("/IRol");
            return (longitud != null && longitud != "" && latitud != null && latitud != "" && rol == '0001');
        },
        defineCoordinates: function () {
            if (!this._uploadDialog2) {
                this._uploadDialog2 = sap.ui.xmlfragment("coordinatesFragment", "demo.views.MiBandeja.fragments.EditCoordinates", this);
                this.getView().addDependent(this._uploadDialog2);
            }
            this._uploadDialog2.open();
        },
        onCloseDialog: function () {
            if (this._uploadDialog2) {
                this._uploadDialog2.destroy();
                this._uploadDialog2 = null;
            }
        },
        saveCoordinates: function () {
            var latitude = sap.ui.core.Fragment.byId("coordinatesFragment", "latitud").getValue();
            var longitude = sap.ui.core.Fragment.byId("coordinatesFragment", "longitud").getValue();

            if (latitude != null && latitude != "" && longitude != null && longitude != "") {
                var coordinates = {
                    "IOption": "15",
                    "IMail": this.getOwnerComponent().getModel("userdata").getProperty("/IMail"),
                    "ISTORECO": [
                        {
                            "Werks": this.getOwnerComponent().getModel("detailLocation").getProperty("/Werks"),
                            "Zlatitud": this.getOwnerComponent().getModel("detailLocation").getProperty("/Zlatitud"),
                            "Zlongitud": this.getOwnerComponent().getModel("detailLocation").getProperty("/Zlongitud")
                        }]
                };

                var response = inboxModel.create("/headInboxSet", coordinates);

                if (response != null) {
                    if (response.ESuccess == "X") {
                        this.onCloseDialog();
                    } else {

                    }
                }
            }
        },
        pdfView: function (url, type) {

            var _pdfurl = this.buildBlobUrl(url, type);

            if (!this._PDFViewer) {
                this.createPDFView(_pdfurl);
            } else {
                if (this._PDFViewer.getSource() !== _pdfurl) {
                    this._PDFViewer = null;
                }
                this.createPDFView(_pdfurl);
            }

            this._PDFViewer.open();
        },
        createPDFView: function (url) {
            this._PDFViewer = new sap.m.PDFViewer({
                width: "auto",
                source: url // my blob url
            });
            jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
        },
        searchRelease: function (oEvent) {
            var sQuery = oEvent.getSource().getValue();
            this.doSearchRelease(sQuery);
        },
        doSearchRelease: function(sQuery){
            var vMail = sap.ui.getCore().getModel("userdata").getProperty("/IMail");

            if (sQuery && sQuery.length > 0) {
                var response = inboxModel.getJsonModelAsync(
                    `/headInboxSet?$expand=ETINBOXUNAV&$filter=IOption eq '2' and IMail eq '${vMail}'  and IName eq '${sQuery}'`,
                    function (jsonModel, parent) {
                        var objResponse = jsonModel.getProperty("/results/0");

                        if (objResponse != null) {
                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), "tableInbox");

                            parent.paginated("tableInbox", "/ETINBOXUNAV", 1, 0);
                        }
                        parent.getView().byId('complPagoList').setBusy(false);

                        parent.inboxMetric();
                    },
                    function (parent) {
                        parent.getView().byId('complPagoList').setBusy(false);
                    },
                    this
                );
            } else {
                this.getInbox();
            }
        },
        clearFilters: function(){
            this.getView().byId("helpDocSearch").setValue("");
            this.getView().byId("releaseSearch").setValue("");
            this.getView().byId("searchLocation").setValue("");
        }
    });
});