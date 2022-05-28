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
            var oDRS2 = this.byId("dateRange");
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
                //var  jsDateObject = this.formatDateQuote(objResponse.getProperty("ESdmens/Zfechaenvio")); 
                var  jsDateObject = this.formatDateQuote(this.getOwnerComponent().getModel("release").getProperty("/ESdmens/Zfechaenvio")); 
                var oDRS2 = this.byId("dateRange");
                oDRS2.setDateValue(jsDateObject);
                oDRS2.setMinDate(jsDateObject);
                oDRS2.setSecondDateValue(jsDateObject);
            }
                      
           
            this.getSplitContObj().toDetail(this.createId("releaseDetail"));
        },
        editRelease: function () {
            var subject = this.getView().byId("subject").getValue();
            var message = this.getView().byId("message").getValue();
            var dateRange = this.getView().byId("dateRange");
           // var suppList = this.getView().byId("suppList");
           // var allSupp = this.getView().byId("allSupp");
            
            var userData = this.getOwnerComponent().getModel("userdata");
            var sendMail = userData.getProperty("/IMail");// this.getView().byId("sendMail"); //userData.getProperty("/EIdusua")
            var idUser = userData.getProperty("/EIdusua");
            var attachControl = this.getView().byId("attacheds");
            var itemsAttach = this.getView().getModel();

            //Fechas de entrega
            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());

            if (!this.validateData(dateRange, subject, message, suppList, allSupp)) {
                return;
            }

            var arrSupplier = [];

            suppList.getItems().forEach(function (f) {
                var sObj = {
                    "Lifnr": f.getProperty("title")
                }
                arrSupplier.push(sObj);
            });

            var files = this.getOwnerComponent().getModel("release").getProperty("/ETATTACHNAV");


            var objRelease = {
                "IOption": "6",
                "IIdusua": idUser, //quien manda
                "IAllpro": this.booleanToAbapTrue(allSupp.getSelected()), // - TODOS LOS PROVEEDORES-
                "ISdate": startDate, //fecha de valides
                "IEdate": endDate,
                "IFmail": this.booleanToAbapTrue(sendMail.getSelected()), //Flag si quieres mandarlo por email
                "ISubject": subject,
                "IText": message, //-TEXTO DEL MENSAJE -
                "ITPROVNAV": arrSupplier, //si no esta marcada IAllpro mandas tabla con prov
                "ITATTACNAV": files
            }

            /*var response = oModel.create("/headInboxSet", objRelease);

            if (response != null) {
                if (response.ESuccess == "X") {
                    sap.m.MessageBox.success("Se ha enviado el comunicado.", {
                        actions: [sap.m.MessageBox.Action.CLOSE],
                        emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                        onClose: function (sAction) {
                            this.goToMainReleases();
                            this.clearFields();
                        }.bind(this)
                    });
                } else {
                    sap.m.MessageBox.success(response.EMessage);
                }
            } else {
                sap.m.MessageBox.error("No se pudo conectar con el servidor, intente nuevamente.");
            }*/
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
        downloadAttach: function (url, type, filename) {
            
            
            switch (type) {
                //case 'application/pdf':
                //    this.pdfView(url, type);
                //    break;
                default:
                    var _fileurl = this.buildBlob(url, type);
                    var parts = filename.split(".");
                    var lenparts = parts.length;
                    var fileextension = parts[lenparts-1];
                    sap.ui.core.util.File.save(_fileurl,parts[0], fileextension, type);
                    //sap.m.URLHelper.redirect(_fileurl, true);
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