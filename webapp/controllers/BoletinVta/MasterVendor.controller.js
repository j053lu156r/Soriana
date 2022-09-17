sap.ui.define([
    "demo/controllers/BaseController",
    "sap/m/PDFViewer",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "sap/m/library"
], function (Controller, PDFViewer, JSONModel, MessageToast, MessageBox, mobileLibrary) {
    "use strict";

    var oPModel = new this.ACcapturados();

	var ButtonType = mobileLibrary.ButtonType;
	var DialogType = mobileLibrary.DialogType;
    var currentRow;
    return Controller.extend("demo.controllers.BoletinVta.MasterVendor", {
        onInit: function () {
            //this.setDaterangeMaxMin();
            this._pdfViewer = new PDFViewer();
            this.getView().addDependent(this._pdfViewer);
            
            this.getView().addEventDelegate({
                onAfterShow: function (oEvent) {
                    var barModel = this.getOwnerComponent().getModel();
                    barModel.setProperty("/barVisible", true);
                    this.getOwnerComponent().setModel(new JSONModel(), "promocionesHdr");
                    this.clearFilters();
                }
            }, this);
            this.configFilterLanguage(this.getView().byId("filterBar"));
        },
        searchData: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var vErrVendor = texts.getProperty("/foliosCap.indVendor");
            var vErrDates = texts.getProperty("/foliosCap.indDates");
            var bContinue = true;

            if (!oPModel.getModel()) {
                oPModel.initModel();
            }

            var promocion = this.getView().byId('promocionInput').getValue();
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            //var vLifnr = this.getView().byId('supplierInput').getValue();
            var texts = this.getOwnerComponent().getModel("appTxts");
            var dateRange = this.getView().byId("aportaDay");

            //Fechas de entrega
            var startDate = this.buildSapDate(dateRange.getDateValue());
            var endDate = this.buildSapDate(dateRange.getSecondDateValue());

            if ( vLifnr === "" || vLifnr === null)  {
                bContinue = false;
                MessageBox.error(vErrVendor);
            } else if ( startDate === "" || startDate === null)  {
                bContinue = false;
                MessageBox.error(vErrDates);
            } else if ( endDate === "" || endDate === null)  {
                bContinue = false;
                MessageBox.error(vErrDates);
            }

            if (bContinue) {

                var url = "promotionsEnteredSet?$filter=";
                if ( promocion !== "" ) {
                    url = url + "Promotion eq '" + promocion + "' and ";
                }

                url = url + " Vendor eq '" + vLifnr + "' and EarliestDate eq '" + startDate + "' and LatestDate eq '" + endDate + "'";

                this.getView().byId('tablePromociones').setBusy(true);
                oPModel.getJsonModelAsync(
                    url,
                    function (jsonModel, parent) {
                        var objResponse = jsonModel.getProperty("/results");

                        if (objResponse != null) {
                            parent.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(objResponse),
                                "promocionesHdr");

                            parent.paginate("promocionesHdr", "/promocionesDet", 1, 0);
                        }
                        parent.getView().byId('tablePromociones').setBusy(false);
                    },
                    function (parent) {
                        parent.getView().byId('tablePromociones').setBusy(false);
                    },
                    this
                );
            }

        },
        onExit: function () {

        },
        filtrado: function (evt) {
            var filterCustomer = [];
            var query = evt.getParameter("query");
            var obFiltro = this.getView().byId("selectFilter");
            var opFiltro = obFiltro.getSelectedKey();
            if (query && query.length > 0) {
                var filter = new sap.ui.model.Filter(opFiltro, sap.ui.model.FilterOperator.Contains, query);
                filterCustomer.push(filter);
            }

            var list = this.getView().byId("promocionesHdr");
            var binding = list.getBinding("items");
            binding.filter(filterCustomer);
        },

        setDaterangeMaxMin: function () {
            var datarange = this.getView().byId('dateRange');
            var date = new Date();
            var minDate = new Date();
            var minConsultDate = new Date();
            minConsultDate.setDate(date.getDate() - 7);
            minDate.setDate(date.getDate() - 30);
            datarange.setSecondDateValue(date);
            datarange.setDateValue(minConsultDate);
        },

        onListItemPress: function (oEvent) {

            var resource = oEvent.getSource().getBindingContext("promocionesHdr").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("promocionesHdr");
            var results = odata.getProperty("/");

            var docResult = results[line]; 

            this.getOwnerComponent().getRouter().navTo("detailBoletinVtaCentros",
                {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    promotion: docResult.Promotion,
                    vendor: docResult.Vendor,
                    promDescription: docResult.Description,
                    IntenalClass: docResult.InternalClass,
                    origin: "vendor"
                }, true);

        },

        openUploadDialog: function (oEvent) {
            var resource = oEvent.getSource().getBindingContext("promocionesHdr").getPath(),
                line = resource.split("/").slice(-1).pop();
                currentRow = line;
            if (!this._uploadDialog) {
                this._uploadDialog = sap.ui.xmlfragment("demo.views.BoletinVta.UploadPDF", this);
                this.getView().addDependent(this._uploadDialog);
            }
            this._uploadDialog.open();
        },

        onCloseDialogUpload: function () {
            if (this._uploadDialog) {
                this._uploadDialog.destroy();
                this._uploadDialog = null;
            }
        },

        btnValidateFile: function (){
            console.log("Upload file");
        },

        onChangeFUP: function (oEvent) {
           
            this._import(oEvent.getParameter("files") && oEvent.getParameter("files")[0]);
		},

        _import: function (file) {
			var that = this;
			if (file && window.FileReader) {
				var reader = new FileReader();

				reader.onload = function (evnt) {
					var content = evnt.target.result.split(",");
					that.saveFileToRemoteServer(content, file);
				};
			}
			switch (file.type) {
			case "application/pdf":
				reader.readAsDataURL(file, "UTF-8");
				break;
				/*case "text/xml":
					reader.readAsText(file, "UTF8");
					break;*/
			default:
				reader.readAsDataURL(file);
				break;
			}

		},

        saveFileToRemoteServer: function (content, file) {

			var that = this;
            var promData = this.getOwnerComponent().getModel("promocionesHdr");
            var results = promData.getProperty("/");
            var docResult = results[currentRow]; 
            promData = this.getOwnerComponent().getModel("promocionesHdr").getData();
			
			var promFile = {
                "Promotion": docResult.Promotion,
				"Vendor": docResult.Vendor,
				"FileName": file.name,
				"Content": content[1],
				"MimeType": file.type,
			};
            var bSuccess = false;
            var sService = "/sap/opu/odata/sap/ZOS_AC_CAPTURADOS_SRV/";
			var oSaveData = new sap.ui.model.odata.ODataModel(sService, true);
			var readurl = "/promFilesSet(Promotion='" + docResult.Promotion + "',Vendor='" + docResult.Vendor + "')";
			oSaveData.setHeaders({
				"X-Requested-With": "X",
                "slug": docResult.Promotion + "|" + docResult.Vendor + "|" + file.name + "|" + file.type
			}); 

            oSaveData.create("/promFilesSet", promFile, null, function () {

				promData[currentRow].Status = "1";
                var oPromModel = new sap.ui.model.json.JSONModel();
				oPromModel.setData(promData);
				that.getOwnerComponent().setModel(oPromModel, "promocionesHdr");
				MessageBox.success("Archivo grabado exitosamente");
				that.onCloseDialogUpload();

			}, function (error) {

				sap.m.MessageBox.alert("Ocurrio un error al grabar el archivo.");
			});
		},

        clearFilters: function () {
            this.getView().byId("promocionInput").setValue("");
            this.getView().byId("supplierInput").setValue("");
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                    name: texts.getProperty("/foliosCap.promocion"),
                    template: {
                        content: "{Promotion}"
                    }
                },
                {
                    name: texts.getProperty("/foliosCap.promDes"),
                    template: {
                        content: "{Description}"
                    }
                },
                {
                    name: texts.getProperty("/foliosCap.currency"),
                    template: {
                        content: "{CurrencyProm}"
                    }
                },
                {
                    name: texts.getProperty("/foliosCap.dateFrom"),
                    template: {
                        content: "{EarliestDate}"
                    }
                },
                {
                    name: texts.getProperty("/foliosCap.dateTo"),
                    template: {
                        content: "{LatestDate}"
                    }
                },
                {
                    name: texts.getProperty("/foliosCap.promClass"),
                    template: {
                        content: "{PromClass}"
                    }
                },
            ];

            this.exportxls('promocionesHdr', '/', columns);
        },
        onPressAccept: function (oEvent) {
 
            var resource = oEvent.getSource().getBindingContext("promocionesHdr").getPath(),
                line = resource.split("/").slice(-1).pop();

            this._confirmDialog(line);

        },

        _confirmDialog: function (line) {
            var texts = this.getOwnerComponent().getModel("appTxts");
            this._line_approve = line;

            if (!this.oApproveDialog) {
                this.oApproveDialog = new sap.m.Dialog({
                    type: DialogType.Message,
                    title: texts.getProperty("/foliosCap.confirm"),
                    content: new sap.m.Text({ text: texts.getProperty("/foliosCap.confirm") }),
                    beginButton: new sap.m.Button({
                        type: ButtonType.Emphasized,
                        text: texts.getProperty("/foliosCap.aprobar"),
                        press: function () {
                            this.oApproveDialog.close();
                            this._approve(this._line_approve);
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: texts.getProperty("/foliosCap.cancelar"),
                        press: function () {
                            this.oApproveDialog.close();
                        }.bind(this)
                    })
                });
            }
            this.oApproveDialog.open();
        },

        onOpenPDF: function(oEvent) {
            var resource = oEvent.getSource().getBindingContext("promocionesHdr").getPath(),
                line = resource.split("/").slice(-1).pop();

            var odata = this.getOwnerComponent().getModel("promocionesHdr");
            var results = odata.getProperty("/");

            var docResult = results[line]; 
            var that = this;
            var url = "promFilesSet(Promotion='" + docResult.Promotion + "',Vendor='" + docResult.Vendor + "')";
  
            oPModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var pdfView = jsonModel.getData(); //getProperty("/results");

                    if (pdfView != null) {
                        
                        //var pdfView = oODataJSONModel.getData();
                        var sSource = pdfView.__metadata.media_src; //pdfView.__metadata.id;
                        sSource = sSource.replace("http", "https");
                        that._pdfViewer.setSource(sSource);

                        that._pdfViewer.setTitle(pdfView.FileName);

                        that._pdfViewer.setDisplayType("Embedded");
                        that._pdfViewer.open();
                    }
                    
                },
                function (parent) {
                    
                },this
            );
        },

        /* onFinancialView: function(){
            this.getOwnerComponent().getRouter().navTo("BoletinVtaDetailPolizas",
                {
                    layout: sap.f.LayoutType.TwoColumnsMidExpanded,
                    company: "2001",
                    document: "5100011100",
                    year: "2022"
                });
        }, */
        
        _approve: function (line) {

            var that = this;
            var promData = this.getOwnerComponent().getModel("promocionesHdr");
            var results = promData.getProperty("/");
            var docResult = results[line];

            var vIuser = this.getOwnerComponent().getModel("userdata").getProperty("/IMail");
            
            var url = "aproveArrangementSet(Promotion='" + docResult.Promotion +"',Vendor='" + docResult.Vendor + "'" +
                      ",PortalUser='" + vIuser + "')";

            this.getView().byId('tablePromociones').setBusy(true);
            oPModel.getJsonModelAsync(
                url,
                function (jsonModel, parent) {
                    var objResponse = jsonModel.getProperty("/");

                    if (objResponse != null) {
                        
                        if (objResponse.Status === "A") {
                            sap.m.MessageBox.information(objResponse.Message);
                            var promData = that.getOwnerComponent().getModel("promocionesHdr").getData();
                            promData[line].Status = "2";
                            var oPromModel = new sap.ui.model.json.JSONModel();
                            oPromModel.setData(promData);
                            that.getOwnerComponent().setModel(oPromModel, "promocionesHdr");
                            parent.getView().byId('tablePromociones').setBusy(false);

                        } else {
                            sap.m.MessageBox.error(objResponse.Message);
                        }
                        
                    }
                    parent.getView().byId('tablePromociones').setBusy(false);
                },
                function (parent) {
                    parent.getView().byId('tablePromociones').setBusy(false);
                },
                this
            );
        }
    });
});