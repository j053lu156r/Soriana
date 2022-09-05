sap.ui.define([
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
    'sap/ui/export/library'
], function (Filter, FilterOperator, JSONModel, Controller, exportLibrary) {
    "use strict";

    var oModel = new this.Pedidostemp();
    var oEdiModel = new this.ModelEDI();
    var oTermsModel = new this.ModelTC();
    var oXlsModel = new this.ModelXlsPedidos();
    var EdmType = exportLibrary.EdmType;

    return Controller.extend("demo.controllers.Orders.Detail", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();
            this.txtTermsCond = this.getView().byId("txtTermsCond");
            this.txtTermsCond2 = this.getView().byId("txtTermsCond2");
            this.txtTermsCond3 = this.getView().byId("txtTermsCond3");
            this.ediModel = new sap.ui.model.odata.v2.ODataModel(oEdiModel.sUrl);
            this.termModel = new sap.ui.model.odata.v2.ODataModel(oTermsModel.sUrl);
            this.xlsModel = new sap.ui.model.odata.v2.ODataModel(oXlsModel.sUrl);

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
            this.getTermsCons();
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
            console.log("Expotar excel!!!!")
            var that = this;
            var aFilters = [];
            aFilters.push(new Filter("Ebeln", FilterOperator.EQ, this._document));
            this.xlsModel.read("/EnvExcelSet", {
                filters: aFilters,
                success: function(response){
                    var base64Data = response.results[0].Excel;
                    const linkSource = `data:application/vnd.ms-excel;charset=utf-8;base64,${base64Data}`;
                    const downloadLink = document.createElement("a");
                    downloadLink.href = linkSource;
                    downloadLink.download = `Excel_Pedido_${that._document}.xls`;
                    downloadLink.click();
                }, 
               error: function(error){
                   sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/order.xlsError"));
                }
            });
        },

        createColumnConfig: function() {
			return [
				{
					label: this.getOwnerComponent().getModel("appTxts").getProperty("/order.excel.supplierNum"),
                    type: EdmType.Number,
					property: 'Lifnr'
				},
				{
					label: this.getOwnerComponent().getModel("appTxts").getProperty("/order.excel.order"),
                    type: EdmType.Number,
					property: 'Ebeln'
				},
				{
					label: this.getOwnerComponent().getModel("appTxts").getProperty("/order.excel.orderDate"),
					property: 'Bedat'
				},
				{
					label: this.getOwnerComponent().getModel("appTxts").getProperty("/order.excel.warehouseCode"),
                    type: EdmType.String,
					property: 'Werks'
				},
                {
					label: this.getOwnerComponent().getModel("appTxts").getProperty("/order.excel.warehouseDesc"),
                    type: EdmType.String,
                    width: 40,
					property: 'Name1'
				},
				{
					label: this.getOwnerComponent().getModel("appTxts").getProperty("/order.excel.fechaEmbarque"),
					property: 'Kdate'
				},
                {
					label: this.getOwnerComponent().getModel("appTxts").getProperty("/order.excel.fechaEndEmbarque"),
					property: 'Kdatb'
				},
                {
					label: this.getOwnerComponent().getModel("appTxts").getProperty("/order.excel.paymentLimit"),
                    type: EdmType.String,
					property: 'Zterm'
				},
                {
					label: this.getOwnerComponent().getModel("appTxts").getProperty("/order.excel.quantity"),
                    type: EdmType.Currency,
                    unitProperty: 'Meins',
					property: 'Menge',
                    displayUnit: true,
                    width: 25
				},
                {
					label: this.getOwnerComponent().getModel("appTxts").getProperty("/order.excel.code"),
					property: 'Ean11',
                    width: 15
				},
                {
					label: this.getOwnerComponent().getModel("appTxts").getProperty("/order.excel.price"),
                    type: EdmType.Currency,
                    unitProperty: 'Waers',
					property: 'Netpr',
                    displayUnit: true,
                    width: 25
				},
                {
					label: this.getOwnerComponent().getModel("appTxts").getProperty("/order.excel.description"),
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
                posicion.Zterm = oCabecera.Zterm;
            });

            return aPosiciones;
        },
        downloadEDI: function(oEvent){
            var that = this;
            var aFilters = [];
            aFilters.push(new Filter("Ebeln", FilterOperator.EQ, this._document));

            this.ediModel.read("/EdiFileSet", {
                filters: aFilters,
                success: function(response){
                    console.log(response)
                    if(response.results.length > 0){
                        var base64Data = response.results[0].Datar;
                        const linkSource = `data:text/plain;charset=utf-8;base64,${base64Data}`;
                        const downloadLink = document.createElement("a");
                        downloadLink.href = linkSource;
                        downloadLink.download = `EDI_${that._document}.txt`;
                        downloadLink.click();
                    } else {
                        sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/order.ediEmptyError"));
                    }
                }, 
                error: function(error){
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/order.downEdiError"));
                }
            });
        },

        getTermsCons: function(oEvent){
            var that = this;
            var vLifnr = this.getConfigModel().getProperty("/supplierInputKey");
            var aFilters = [];
            aFilters.push(new Filter("Lifnr", FilterOperator.EQ, vLifnr));
            this.termModel.read("/TxtTermCondSet", {
                filters: aFilters,
                success: function(response){
                    var text = response.results[0].Texto;
                    that.txtTermsCond.setText(text);
                    that.txtTermsCond2.setText(text);
                    that.txtTermsCond3.setText(text);
                }, 
                error: function(error){
                    sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/order.termconsError"));
                }
            });
        }
    });
});