sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
    "sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
    "use strict";

    var oModel = new this.Pedidostemp();
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
        
            var columns = [
                {
                    name: "Pedidos",
                    template: {
                        content: "{Ebeln}"
                    }
                },
                {
                    name: "Posicion",
                    template: {
                        content: "{Ebelp}"
                    }
                },
                {
                    name: this.getOwnerComponent().getModel("appTxts").getProperty("/order.assorment"),
                    template: {
                        content: this.getOwnerComponent().getModel("tableDetailMoves").getProperty( "/OEKKONAV/results/0/Telf1")
                    }
                },                
                {
                    name: "Estatus",
                    template: {
                        content: this.formatSatusOrder(this.getOwnerComponent().getModel("tableDetailMoves").getProperty("/OEKKONAV/results/0/Elikz" ) )
                    }
                },
                {
                    name: this.getOwnerComponent().getModel("appTxts").getProperty("/order.shipmentbegin"),
                    template: {
                        content: this.getOwnerComponent().getModel("tableDetailMoves").getProperty("/OEKKONAV/results/0/Kdatb")
                    }
                },
                {
                    name: this.getOwnerComponent().getModel("appTxts").getProperty("/order.shipmentend"),
                    template: {
                        content: this.getOwnerComponent().getModel("tableDetailMoves").getProperty("/OEKKONAV/results/0/Kdate")
                    }
                },
                {
                    name: this.getOwnerComponent().getModel("appTxts").getProperty("/order.date"),
                    template: {
                        content: this.getOwnerComponent().getModel("tableDetailMoves").getProperty("/OEKKONAV/results/0/Bedat")
                    }
                },
                {
                    name: "Proveedor",
                   template: {
                        content: this.getOwnerComponent().getModel("tableDetailMoves").getProperty("/OEKKONAV/results/0/Lifnr") 
                    }
                },
                {
                    name: "Monto Total",
                    template: {
                        content: this.getOwnerComponent().getModel("tableDetailMoves").getProperty("/OEKKONAV/results/0/Netwr") 
                    }
                },
                {
                    name: "Moneda",
                    template: {
                        content: this.getOwnerComponent().getModel("tableDetailMoves").getProperty("/OEKKONAV/results/0/Waers")
                    }
                },
               {
                    name: "Precio Unitario",
                    template: {
                        content: "{Netpr}"
                    }
                },
                {
                    name: "Moneda",
                    template: {
                        content: "{Waers}"
                    }
                },                
               {
                    name: "Monto Posicion",
                    template: {
                        content: "{Brtwr}"
                    }
                },
                {
                    name: "Moneda",
                    template: {
                        content: "{Waers}"
                    }
                },               
                {
                    name: "Fecha entrega",
                    template: {
                        content: this.getOwnerComponent().getModel("tableDetailMoves").getProperty("/OEKKONAV/results/0/Eindt")                        
                    }
                },
                {
                    name: "Codigo de Barras",
                    template: {
                        content: "{Ean11}"
                    }
                },
                {
                    name: "Descripcion",
                    template: {
                        content: "{Txz01}"
                    }
                },
                {
                    name: "Cantidad",
                    template: {
                        content: "{Menge}"
                    }
                },
                {
                    name: "Unidad de Medida",
                    template: {
                        content: "{Meins}"
                    }
                },               
                {
                    name: "Cantidad Entregada",
                    template: {
                        content: "{Centregada}"
                    }
                },
                {
                    name: "Unidad de Medida",
                    template: {
                        content: "{Meins}"
                    }
                },                
                {
                    name: "Cantidad Restante",
                    template: {
                        content: "{Cresta}"
                    }
                },
                {
                    name: "Unidad de Medida",
                    template: {
                        content: "{Meins}"
                    }
                },                
                {
                    name: "Sucursal",
                    template: {
                        content: "{Werks}"
                    }
                },  
                {
                    name: "Nombre Sucursal",
                    template: {
                        content: "{Name1}"
                    }
                },                                                  
               {
                    name: "Capacidad de empaque",
                    template: {
                        content: "{Cempaque}"
                    }
                },
                {
                    name: "Unidad de Medida",
                    template: {
                        content: "{Cempumb}"
                    }
                },                                  
            ];

            this.exportxls('tableDetailMoves', '/Oekponav/results', columns);
        }
    });
});