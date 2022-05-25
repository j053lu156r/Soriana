sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
], function (JSONModel, Controller, Fragment) {
    "use strict";

    var cModel1 = new this.Citas1();
    var cModel2 = new this.Citas2();
    return Controller.extend("demo.controllers.Quotes.Detail", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailQuotes").attachPatternMatched(this._onDocumentMatched, this);

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
        handleItemPress: function (oEvent) {
            var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(2),
                orderPath = oEvent.getSource().getBindingContext("tableQuotesDetail").getPath(),
                line = orderPath.split("/").slice(-1).pop(),
                oView = this.getView();;

            var oData = this.getOwnerComponent().getModel("tableQuotesDetail");
            var result = oData.getProperty("/ECITASDETNAV/Paginated/results");
            var document = result[line].ZPedido;

            var positions = oData.getProperty("/ECITASARTPEDNAV/results");

            var posModel = {
                "ECITASARTPEDNAV": {
                    "results": positions.filter(event => event.ZNumpedido == document)
                }
            };

            if (!this._posDetailsDialog) {
                this._posDetailsDialog = sap.ui.xmlfragment("posDetQuoteFragment", "demo.views.Quotes.PosDetail", this);
                this.getView().addDependent(this._posDetailsDialog);
            }

            this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(posModel),
                "tableQuotesDetailPositions");

            this.paginate("tableQuotesDetailPositions", "/ECITASARTPEDNAV", 1, 0);

            this._posDetailsDialog.open();

        },
        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.oRouter.navTo("detailQuotes", { layout: sNextLayout, document: this._document });
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.oRouter.navTo("detailQuotes", { layout: sNextLayout, document: this._document });
        },
        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
            this.oRouter.navTo("masterQuotes", { layout: sNextLayout });
        },
        _onDocumentMatched: function (oEvent) {
            this._document = oEvent.getParameter("arguments").document || this._document || "0";
            this._lifnr = this.getConfigModel().getProperty("/supplierInputKey");

            var url = `/HeaderCITASSet?$expand=ECITASCONSNAV,ECITASDETNAV,ECITASARTPEDNAV&$filter= IOption eq '2'`;
            url += ` and IZproveedor eq '${this._lifnr}' `;

            if (this._document != null && this._document != "") {
                url += ` and IZfolioCita eq '${this._document}'`;
            }

            var dueModel = cModel2.getJsonModel(url);

            var ojbResponse = dueModel.getProperty("/results/0");

            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                "tableQuotesDetail");

            this.paginate("tableQuotesDetail", "/ECITASDETNAV", 1, 0);
        },
        buildExcelPositions: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            var columns = [
                {
                    name: texts.getProperty("/quotes.order"),
                    template: {
                        content: "{ZNumpedido}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.position"),
                    template: {
                        content: "{ZPosicion}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.branch"),
                    template: {
                        content: "{ZSucursal}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.branch"),
                    template: {
                        content: "{ZDescrsucursal}"
                    }
                },
                ,
                {
                    name: texts.getProperty("/quotes.codebar"),
                    template: {
                        content: "{Zean11}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.description"),
                    template: {
                        content: "{ZDescrarticulo}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.palletBox"),
                    template: {
                        content: "{ZCtdartarima1}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.quantity"),
                    template: {
                        content: "{ZCtdtarrec}"
                    }
                }
            ];

            this.exportxls('tableQuotesDetailPositions', '/ECITASARTPEDNAV/results', columns);
        },
        buildExcelOrders: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            let Encabezado = this.getOwnerComponent().getModel("tableQuotesDetail");

            var columns = [
                {
                    name: texts.getProperty("/quotes.quoteFolio"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/ZfolioCita")
                    }
                },
                {
                    name: texts.getProperty("/quotes.branch"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/Zsucursal")
                    }
                },
                {
                    name: texts.getProperty("/quotes.branch"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/Zdescrsucursal")
                    }
                },
                {
                    name: texts.getProperty("/quotes.platform"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/Zanden")
                    }
                },
                {
                    name: texts.getProperty("/quotes.turn"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/Zturno")
                    }
                },
                {
                    name: texts.getProperty("/quotes.turn"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/ZTipoturno")
                    }
                },
                {
                    name: texts.getProperty("/quotes.status"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/Zstatus")
                    }
                },
                {
                    name: texts.getProperty("/quotes.quoteType"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/ZtipoCita")
                    }
                },
                {
                    name: texts.getProperty("/quotes.productType"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/ZtipoProd")
                    }
                },
                {
                    name: texts.getProperty("/quotes.unitType"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/ZtipoUnidad")
                    }
                },
                {
                    name: texts.getProperty("/quotes.assortmentType"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/ZtipoSurtido")
                    }
                },
                {
                    name: texts.getProperty("/quotes.codesNum"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/ZnumCodigos")
                    }
                },
                {
                    name: texts.getProperty("/quotes.totalpackages"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/ZtotalBultoped")
                    }
                },
                {
                    name: texts.getProperty("/quotes.shipmentEndDate"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/Zfechafinemb")
                    }
                },
                {
                    name: texts.getProperty("/quotes.packagesReceived"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/ZtotalBultorec")
                    }
                },
                {
                    name: texts.getProperty("/quotes.weight"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/Zpeso")
                    }
                },
                {
                    name: texts.getProperty("/quotes.quoteDate"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/Zfecharegcita")
                    }
                },
                {
                    name: texts.getProperty("/quotes.dateReceipt"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/ZfechaRecibo")
                    }
                },
                {
                    name: texts.getProperty("/quotes.boardingStartDate"),
                    template: {
                        content: Encabezado.getProperty("/ECITASCONSNAV/results/0/Zfechainiemb")
                    }
                },
                {
                    name: texts.getProperty("/quotes.order"),
                    template: {
                        content: "{ZPedido}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.branch"),
                    template: {
                        content: "{ZSucursal}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.branch"),
                    template: {
                        content: "{Zdescrsucursal}"
                    }
                },
                ,
                {
                    name: texts.getProperty("/quotes.totalPackageOrdered"),
                    template: {
                        content: "{ZTotalbultoped}"
                    }
                },
                {
                    name: texts.getProperty("/quotes.totalPackageReceive"),
                    template: {
                        content: "{ZTotalbultorec}"
                    }
                }
            ];

            this.exportxls('tableQuotesDetail', '/ECITASDETNAV/results', columns);
        },
        selectedParamQuote: function (oEvent) {
            var selectedKey = oEvent.getParameter("selectedItem").getProperty("key");
            var vDate = sap.ui.core.Fragment.byId("editValuesQuote", "paramQuoteValue");

            switch (selectedKey) {
                case "1":
                    vDate.setValue(
                        this.getOwnerComponent().getModel("tableQuotesDetail").getProperty("/ECITASCONSNAV/results/0/ZfechaRecibo")
                    );;
                    break;
                case "2":
                    vDate.setValue(
                        this.getOwnerComponent().getModel("tableQuotesDetail").getProperty("/ECITASCONSNAV/results/0/Zfechainiemb")
                    );
                    break;
                case "3":
                    vDate.setValue(
                        this.getOwnerComponent().getModel("tableQuotesDetail").getProperty("/ECITASCONSNAV/results/0/Zfechafinemb")
                    );
                    break;
                case "4":
                    sap.ui.core.Fragment.byId("editValuesQuote", "inputQuoteValue").setValue(
                        this.getOwnerComponent().getModel("tableQuotesDetail").getProperty("/ECITASCONSNAV/results/0/Zanden")
                    );
                    break;
            }

            if (selectedKey == 4) {
                sap.ui.core.Fragment.byId("editValuesQuote", "paramQuoteValue").setVisible(false);
                sap.ui.core.Fragment.byId("editValuesQuote", "inputQuoteValue").setVisible(true);

                sap.ui.core.Fragment.byId("editValuesQuote", "paramQuoteValue").setValue("");
            } else {
                sap.ui.core.Fragment.byId("editValuesQuote", "paramQuoteValue").setVisible(true);
                sap.ui.core.Fragment.byId("editValuesQuote", "inputQuoteValue").setVisible(false);

                sap.ui.core.Fragment.byId("editValuesQuote", "inputQuoteValue").setValue("");
            }
        },
        handleEditBtn: function () {
            
            if (!this._EditQuoteDialog) {
                this._EditQuoteDialog = sap.ui.xmlfragment("editValuesQuote", "demo.views.Quotes.EditDates", this);
                this.getView().addDependent(this._EditQuoteDialog);
            }

            this._EditQuoteDialog.setModel(new JSONModel());
            this._EditQuoteDialog.setEscapeHandler((oEscapeHandler) => {
                this.handleCloseEdit();
            }, this);

            sap.ui.core.Fragment.byId("editValuesQuote", "paramQuoteValue")
                .setValue(
                    this.getOwnerComponent().getModel("tableQuotesDetail").getProperty("/ECITASCONSNAV/results/0/ZfechaRecibo")
                );;
            this._EditQuoteDialog.open();
        },
        hancleCandel: function (quoteNo, iOpt) {
            var strQuestion = "";
            switch (iOpt) {
                case 2:
                    strQuestion = this.getView().getModel("appTxts").getProperty("/quotes.cancelQuote");
                    if (!this.hasAccess(34)) {
                        return false;
                    }
                    break;
                case 3:
                    strQuestion = this.getView().getModel("appTxts").getProperty("/quotes.rejectQuote");
                    if (!this.hasAccess(33)) {
                        return false;
                    }
                    break;
            }

            sap.m.MessageBox["confirm"](strQuestion, {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        this.cancelQuote(quoteNo, iOption);
                    }
                }.bind(this)
            });
        },
        cancelQuote: function (quoteNo, iOption) {
            var url = `/Valida_citasSet?$expand=Po_validas&$filter=IOption eq '${iOption}' and ICita eq '${quoteNo}'`;

            this.callMethods(url);
        },
        editValues: function (quoteNo) {
            var param = sap.ui.core.Fragment.byId("editValuesQuote", "paramQuoteId").getSelectedKey();
            var value = "";

            if (param == 4) {
                value = sap.ui.core.Fragment.byId("editValuesQuote", "inputQuoteValue").getValue();
            } else {
                value = sap.ui.core.Fragment.byId("editValuesQuote", "paramQuoteValue").getValue();
            }

            var url = `/Valida_citasSet?$expand=Po_validas&$filter=IOption eq '4' and ICita eq '${quoteNo}'` +
                ` and IParametro eq '${param}'` +
                ` and IValor eq '${value}'`;

            this.callMethods(url);
        },
        callMethods: function (url) {

            var response = cModel1.getJsonModel(url);

            if (response != null) {
                var objResponse = response.getProperty("/results/0");
                if (objResponse != null) {
                    if (objResponse.ESuccess == "X") {
                        sap.m.MessageBox.success(objResponse.EMessage);

                        this.handleClose();
                        this.handleCloseEdit();
                    } else {
                        sap.m.MessageBox.error(objResponse.EMessage);
                    }
                }
            }

        },
        groupByAuto: function (data, key) {
            var groups = {};
            for (var i in data) {
                if (!groups.hasOwnProperty(data[i][key])) groups[data[i][key]] = [];
                groups[data[i][key]].push(data[i]);
            }
            return groups;
        },
        onCloseDialogPosDetails: function () {
            if (this._posDetailsDialog) {
                this._posDetailsDialog.destroy();
                this._posDetailsDialog = null;
            }
        },
        printQuoteCard: function () {
            if (!this._CardDialog) {
                this._CardDialog = sap.ui.xmlfragment("printBoxesLabels", "demo.views.Quotes.AppointmentCard", this);
                this.getView().addDependent(this._CardDialog);
            }

            var vTexts = this.getView().getModel("appTxts");
            var vModel = this.getView().getModel("tableQuotesDetail");
            var vFolio = vModel.getProperty("/ECITASCONSNAV/results/0/ZfolioCita");
            var vSucursal = `${vModel.getProperty("/ECITASCONSNAV/results/0/Zsucursal")} - ${vModel.getProperty("/ECITASCONSNAV/results/0/Zdescrsucursal")}`;
            var vUnit = `${vModel.getProperty("/ECITASCONSNAV/results/0/ZtipoUnidad")}`;
            var vCarrier = `${vModel.getProperty("/ECITASCONSNAV/results/0/ZTransportista")}`;
            var vSuppliert = this.getConfigModel().getProperty("/supplierInput");

            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MMMM d, yyyy" });
            var dateFormatted = dateFormat.format(new Date(vModel.getProperty("/ECITASCONSNAV/results/0/Zfecharegcita")));

            var ojbResponse = {};

            var html = "";

            html = '<div id="codeGroupDiv" style= "text-align: center; width: 100%;" >' +
                `<p style="width:100%;text-align:center;"><h1>${this.getView().getModel("appTxts").getProperty("/quotes.cardTitle")}</h1></p>` +
                '<img src ="./images/LogoSoriana.svg" width="350px" />' +
                '<div style="width:100%;">' +
                `<p style="width:100%;font-size:smaller;text-align:right;"><font style="font-weight:bold;">${vTexts.getProperty("/quotes.quoteFolio")}:` +
                `</font> ${vFolio}</p>` +
                `<p style="width:100%;font-size:smaller;text-align:right;"><font style="font-weight:bold;">${vTexts.getProperty("/quotes.dateTimeRegAppointment")}:` +
                `</font> ${dateFormatted}</p>` +
                `<p style="width:100%;font-size:smaller;text-align:left;"><font style="font-weight:bold;">${vTexts.getProperty("/quotes.cedis")}:` +
                `</font> ${vSucursal}</p>` +
                `<p style="width:100%;font-size:smaller;text-align:left;"><font style="font-weight:bold;">${vTexts.getProperty("/quotes.supplier")}:` +
                `</font> ${vSuppliert}</p>` +
                `<p style="width:100%;font-size:smaller;text-align:left;"><font style="font-weight:bold;">${vTexts.getProperty("/quotes.carrier")}:` +
                `</font> ${vCarrier}</p>` +
                `<p style="width:100%;font-size:smaller;text-align:left;"><font style="font-weight:bold;">${vTexts.getProperty("/quotes.unitType")}:` +
                `</font> ${vUnit}</p>` +
                '<svg class="barcode"' +
                `jsbarcode-value="${vFolio}"` +
                'jsbarcode-textmargin="0"' +
                'jsbarcode-fontoptions="bold">' +
                '</svg>';
            html += '</div></div>';

            ojbResponse.html = html;

            this._CardDialog.setModel(new JSONModel(ojbResponse));
            this._CardDialog.open();
            JsBarcode(".barcode").init();
        },
        handleCloseCard: function () {
            if (this._CardDialog) {
                this._CardDialog.destroy();
                this._CardDialog = null;
            }
        },
        handleCloseEdit: function () {
            if (this._EditQuoteDialog) {
                this._EditQuoteDialog.destroy();
                this._EditQuoteDialog = null;
            }
        },
        saveCoordinates: function () {
            var element = document.getElementById('codeGroupDiv');
            var opt = {
                margin: 1,
                filename: 'GroupCode.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            html2pdf().set(opt).from(element).save();
            element.clear();
        },
        senMailCard: function () {
            var vMial = this.getOwnerComponent().getModel("userdata").getProperty("/Esusdata/SmtpAddr");
            var vSupplier = this.getConfigModel().getProperty("/supplierInputKey");

            var element = document.getElementById('codeGroupDiv');
            var opt = {
                margin: 1,
                filename: 'GroupCode.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            html2pdf().set(opt).from(element).outputPdf().then(function (pdf) {
                var obj = {
                    "IOption": "5",
                    "ICita": this._document,
                    "IEmail": vMial,
                    "ILifnr": vSupplier,
                    "EMAILSet": [{
                        "Zdocvalue64": pdf
                    }
                    ]
                };
                var url = `/Valida_citasSet`;

                var response = cModel1.create(url, obj);

                if (response != null) {
                    if (response.ESuccess == "X") {
                        sap.m.MessageBox.success(response.EMessage);
                    } else {
                        sap.m.MessageBox.error(response.EMessage);
                    }
                }
            });
        }
    });
});
