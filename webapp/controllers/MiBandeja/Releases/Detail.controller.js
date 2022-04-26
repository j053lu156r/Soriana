sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
    "use strict";
    
    var inboxModel = new this.MyInbox();

	return Controller.extend("demo.controllers.MiBandeja.Releases.Detail", {
		onInit: function () {
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");

			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("detailRelease").attachPatternMatched(this._onDocumentMatched, this);

			[oExitButton, oEnterButton].forEach(function (oButton) {
				oButton.addEventDelegate({
					onAfterRendering: function () {
						if (this.bFocusFullScreenButton) {
							this.bFocusFullScreenButton = false;
							oButton.focus();
						}
					}.bind(this)
				});
			}, this);
		},
		handleFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detailRelease", {layout: sNextLayout, releaseId: this._release});
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detailRelease", {layout: sNextLayout, releaseId: this._release});
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("masterRelease", {layout: sNextLayout});
		},
		_onDocumentMatched: function (oEvent) {
            this._release = oEvent.getParameter("arguments").releaseId || this._release || "0";
            var vMail = this.getOwnerComponent().getModel("userdata").getProperty("/IMail"); 

            var response = inboxModel
                .getJsonModel("/headInboxSet?$expand=ETATTACHNAV&$filter=IOption eq '4'"
                    + " and IMail eq '" + vMail + "'"
                    + " and IIdmen eq '" + this._release + "'");

            if (response != null) {
                var objResponse = response.getProperty("/results/0");
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), "release");
            }

            this.getSplitContObj().toDetail(this.createId("releaseDetail"));
        },
        downloadAttach: function (url, type) {
            switch (type) {
                case 'application/pdf':
                    this.pdfView(url, type);
                    break;
                default:
                    var _fileurl = this.buildBlobUrl(url, type);
                    sap.m.URLHelper.redirect(_fileurl, true);
                    break;
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
        }
	});
});