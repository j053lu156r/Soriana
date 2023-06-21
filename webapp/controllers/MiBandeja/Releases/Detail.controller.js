sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
    "use strict";
    
    var inboxModel = new this.MyInbox();
   

	return Controller.extend("demo.controllers.MiBandeja.Releases.Detail", {
		onInit: function () {
            console.log("3")
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
            console.log(this.getOwnerComponent().getModel("userdata"))
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
            
           /* var response = inboxModel
                .getJsonModel("/headInboxSet?$expand=ETATTACHNAV&$filter=IOption eq '4'"
                    + " and IMail eq '" + vMail + "'"
                    + " and IIdmen eq '" + this._release + "'");*/

            var response = inboxModel
            .getJsonModel("/headInboxSet?$expand=ETATTACHNAV,ZTTSP_MENSPROVSet&$filter=IOption eq '4'"
              + " and IMail eq '" + vMail + "'"
              + " and IIdmen eq '" + this._release + "'");
            if (response != null) {
                var objResponse = response.getProperty("/results/0");
                this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse), "release");
                this.paginate('release', '/ZTTSP_MENSPROVSet', 1, 0);
             
                
            }
                      
           
            //this.getSplitContObj().toDetail(this.createId("releaseDetail"));  no se para que pusieron esta funcion
        },
        
       
        editRelease: function () {
            if(!this.hasAccess(49)){
                return
            }
            //var subject = this.getView().byId("subject").getValue();
            var subject = this.getOwnerComponent().getModel("release").getProperty("/ESdmens/Ztext"); 
            var message = this.getView().byId("message").getValue();
            var dateRange = this.getView().byId("dateRange");
           // var suppList = this.getView().byId("suppList");
           // var allSupp = this.getView().byId("allSupp");
            
            var userData = this.getOwnerComponent().getModel("userdata");
          
            var sendMail = userData.getProperty("/IMail");// this.getView().byId("sendMail"); //userData.getProperty("/EIdusua")
            var idUser = userData.getProperty("/EIdusua");
            var attachControl = this.getView().byId("attacheds");
            var itemsAttach = this.getView().getModel();
            var arrSupplier = [];
            var files = this.getOwnerComponent().getModel("release").getProperty("/ETATTACHNAV");


            var objRelease = {
                "IOption": "6",
                "IIdusua": idUser, //quien manda
                "IAllpro":"",
                "ISdate": "", //startDate, fecha de valides
                "IEdate": "", // endDate,
                "IIdmen" :this._release ,
                "IFmail": "",
                "ISubject":  subject,
                "IText": message, //-TEXTO DEL MENSAJE -
                "ITPROVNAV": [],
                "ITATTACNAV": []
            }

            var response = inboxModel.create("/headInboxSet", objRelease);

            if (response != null) {
                if (response.ESuccess == "X") {
                    sap.m.MessageBox.success("Se ha modificado el comunicado.", {
                        actions: [sap.m.MessageBox.Action.CLOSE],
                        emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                        onClose: function (sAction) {
                            this.goToMainRelease();
                            this.clearFields();
                        }.bind(this)
                    });
                } else {
                    if(response.mensaje != null){
                        sap.m.MessageBox.error(response.mensaje);
                    }else{
                        sap.m.MessageBox.error("Ocurrio un error");
                    }
                    
                }
            } else {
                sap.m.MessageBox.error("No se pudo conectar con el servidor, intente nuevamente.");
            }
        },
        goToMainRelease: function () {
           
            this.oRouter.navTo("masterRelease");
           // this.clearFields();
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