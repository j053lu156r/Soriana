sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
    'sap/ui/export/Spreadsheet',
    'sap/m/MessageToast',
    'sap/ui/export/library'
], function (JSONModel, Controller, Spreadsheet, MessageToast, exportLibrary) {
    "use strict";

    var oModel = new this.Pedidostemp();
    var EdmType = exportLibrary.EdmType;

    return Controller.extend("demo.controllers.Orders.Detail", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailOrders").attachPatternMatched(this._onDocumentMatched, this);

            /*[oExitButton, oEnterButton].forEach(function (oButton) {
                oButton.addEventDelegate({
                    onAfterRendering: function () {
                        if (this.bFocusFullScreenButton) {
                            this.bFocusFullScreenButton = false;
                            oButton.focus();
                        }
                    }.bind(this)
                });
            }, this);*/
        },
        handleItemPress: function (oEvent) {
            var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
                supplierPath = oEvent.getSource().getBindingContext("tableDetailMoves").getPath();

            var objModel = this.getOwnerComponent().getModel("tableDetailMoves").getProperty(supplierPath);


            if (!this._oDialog || this.oDialog === undefined) {
                this._oDialog = sap.ui.xmlfragment("demo.fragments.Exhaustion", this);
            }

            this.getView().addDependent(this._oDialog);

			// toggle compact style
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
            this._oDialog.setModel(new JSONModel(objModel));
			this._oDialog.open();
        },
        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.oRouter.navTo("detailOrders", { layout: sNextLayout, document: this._document });
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.oRouter.navTo("detailOrders", { layout: sNextLayout, document: this._document });
        },
        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
            this.oRouter.navTo("masterOrders", { layout: sNextLayout });
        },
        _onDocumentMatched: function (oEvent) {
            this._document = oEvent.getParameter("arguments").document || this._document || "0";

            var url = "notCreditSet?$expand=Oekponav,OEKKONAV,OEKKOADVRNAV&$filter=IOption eq '5' and IEbeln eq '" + this._document + "'";
                       
            var dueModel = oModel.getJsonModel(url);

            var ojbResponse = dueModel.getProperty("/results/0");
            //var records = ojbResponse.Oekponav;
            console.log(dueModel);

            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                "tableDetailMoves");

            this.paginate("tableDetailMoves", "/Oekponav", 1, 0);
            this.paginate("tableDetailMoves", "/OEKKOADVRNAV", 1, 0);
        },
        formatSatusOrder: function (status) {
            if (status) {
                return 'Cerrado';
            } else {
                return 'Abierto';
            }            
        },
        formatBranch: function (flag, valor1, valor2, valor3){
            var text = "";
            if (flag == "X"){
                text = valor1;
            } else {
                text = valor2 + " " + valor3;
            }

            return text;
        },

        onCloseDialog: function(){
            if (this._oDialog) {
				this._oDialog.destroy();
				this._oDialog = null;
			}
        }, 
        onExit: function(){
            this.onCloseDialog();
        },
        buildExcel: function(){

            var oModel = this.getOwnerComponent().getModel("tableDetailMoves").getProperty("/OEKKONAV/results/0");
            var columns = this.createColumnConfig();
            var aDataPosiciones = this.createData();

            var oSettings = {
				workbook: { columns: columns },
				dataSource: aDataPosiciones,
                fileName: 'Detalle Pedido ' + oModel.Ebeln + '.xlsx',
			};

            var oSheet = new Spreadsheet(oSettings);
            oSheet.build().then( function() {
                MessageToast.show('Spreadsheet export has finished');
            }).finally(oSheet.destroy);
        },

        createColumnConfig: function() {
			return [
				{
					label: 'Número de proveedor',
                    type: EdmType.Number,
					property: 'Lifnr'
				},
				{
					label: 'Número de pedido',
                    type: EdmType.Number,
					property: 'Ebeln'
				},
				{
					label: 'Fecha de pedido',
					property: 'Bedat'
				},
				{
					label: 'Codigo de tienda',
                    type: EdmType.String,
					property: 'Werks'
				},
                {
					label: 'Descripcion de tienda',
                    type: EdmType.String,
                    width: 40,
					property: 'Name1'
				},
				{
					label: 'Fecha de inicio de embarque',
					property: 'Kdate'
				},
                {
					label: 'Fecha de fin de embarque',
					property: 'Kdatb'
				},
                {
					label: 'Cantidad pedida',
                    type: EdmType.Currency,
                    unitProperty: 'Meins',
					property: 'Menge',
                    displayUnit: true,
                    width: 25
				},
                {
					label: 'Codigo',
					property: 'Ean11',
                    width: 15
				},
                {
					label: 'Precio',
                    type: EdmType.Currency,
                    unitProperty: 'Waers',
					property: 'Netpr',
                    displayUnit: true,
                    width: 25
				},
                {
					label: 'Descripcion de articulo',
					property: 'Txz01',
                    type: EdmType.String,
                    width:40
				}];
		},

        createData: function(){
            var oCabecera = this.getOwnerComponent().getModel("tableDetailMoves").getProperty("/OEKKONAV/results/0");
            var aPosiciones = this.getOwnerComponent().getModel("tableDetailMoves").getProperty("/Oekponav/results");

            aPosiciones.forEach(function(posicion) {
                posicion.Lifnr = oCabecera.Lifnr;
                posicion.Bedat = oCabecera.Bedat;
                posicion.Kdate = oCabecera.Kdate;
                posicion.Kdatb = oCabecera.Kdatb;
            });

            return aPosiciones;
        }
    });
});