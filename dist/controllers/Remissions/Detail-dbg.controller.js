sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "demo/controllers/BaseController",
    "sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
    "use strict";

    var oModel = new this.Remissions();
    var cModel = new this.RemissionCancel();
    var oEtiquetas = new this.EtiquetasAviso();
    return Controller.extend("demo.controllers.Remissions.Detail", {
        cajasTarimas: null,
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");
            
            this.etiquetasModel = new sap.ui.model.odata.v2.ODataModel(oEtiquetas.sUrl);

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();

            this.oRouter.getRoute("detailRemission").attachPatternMatched(this._onDocumentMatched, this);

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
                supplierPath = oEvent.getSource().getBindingContext("tableItemsCfdi").getPath(),
                supplier = supplierPath.split("/").slice(-1).pop();

        },
        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.oRouter.navTo("detailRemission", { layout: sNextLayout, document: this._document, folio: this._folio });
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.oRouter.navTo("detailRemission", { layout: sNextLayout, document: this._document, folio: this._folio });
        },
        handleClose: function () {
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
            this.oRouter.navTo("masterRemission", { layout: sNextLayout });
        },
        _onDocumentMatched: function (oEvent) {
            this._document = oEvent.getParameter("arguments").document || this._document || "0";
            this._folio = oEvent.getParameter("arguments").folio;
            this._lifnr = this.getConfigModel().getProperty("/supplierInputKey");
            //let oHeaderRem = this.getOwnerComponent().getModel("tableRemissionDetail");
            //let folio = oHeaderRem.getProperty("/Eremh/Zremfolio")

            var url = `/HdrAvisoSet?$expand=EFREMNAV,ETREMDNAV&$filter=IOption eq '2' and ILifnr eq '${this._lifnr}' and IZremision eq '${this._document}' and IZremfolio eq '${this._folio}'`;
            var dueModel = oModel.getJsonModel(url);

            var ojbResponse = dueModel.getProperty("/results/0");
            //var records = ojbResponse.EDOCDTLNAV;

            this.getOwnerComponent().setModel(new JSONModel(ojbResponse),
                "tableRemissionDetail");

            this.paginate('tableRemissionDetail', '/ETREMDNAV', 1, 0);
        },
        buildExcel: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");
            let Encabezado = this.getOwnerComponent().getModel("tableRemissionDetail");

            var columns = [
                {
                    name: texts.getProperty("/rem.folio"),
                    template: {
                        content: Encabezado.getProperty("/Eremh/Zremision")
                    }
                },
                {
                    name: texts.getProperty("/rem.createDate"),
                    template: {
                        content: Encabezado.getProperty("/Eremh/Zfechrem")
                    }
                },
                {
                    name: texts.getProperty("/rem.destination"),
                    template: {
                        content: Encabezado.getProperty("/Eremh/Werks")
                    }
                },
                {
                    name: texts.getProperty("/rem.typeRemission"),
                    template: {
                        content: Encabezado.getProperty("/Eremh/Ztipoaviso")
                    }
                },
                {
                    name: texts.getProperty("/rem.statusRemission"),
                    template: {
                        content: Encabezado.getProperty("/Eremh/Zstatus")
                    }
                },
                {
                    name: texts.getProperty("/rem.cancelStatus"),
                    template: {
                        content: Encabezado.getProperty("/Eremh/ZstatusCan")
                    }
                },
                {
                    name: texts.getProperty("/rem.delivdate"),
                    template: {
                        content: Encabezado.getProperty("/Eremh/Zfechem")
                    }
                },
                {
                    name: texts.getProperty("/rem.appointment"),
                    template: {
                        content: Encabezado.getProperty("/Eremh/Zcita")
                    }
                },
                {
                    name: texts.getProperty("/rem.typedeliv"),
                    template: {
                        content: Encabezado.getProperty("/Eremh/Ztipoentreg")
                    }
                },
                {
                    name: texts.getProperty("/rem.countorders"),
                    template: {
                        content: Encabezado.getProperty("/Eremh/Zcantped")
                    }
                },
                {
                    name: texts.getProperty("/rem.packagenumber"),
                    template: {
                        content: Encabezado.getProperty("/Eremh/Zcantbul")
                    }
                },
                {
                    name: texts.getProperty("/rem.order"),
                    template: {
                        content: "{Ebeln}"
                    }
                },
                {
                    name: texts.getProperty("/rem.palletbox"),
                    template: {
                        content: "{Cajtar}"
                    }
                },
                ,
                {
                    name: texts.getProperty("/rem.destination"),
                    template: {
                        content: "{Name1}"
                    }
                },
                {
                    name: texts.getProperty("/rem.codebar"),
                    template: {
                        content: "{Ean11}"
                    }
                },
                {
                    name: texts.getProperty("/rem.description"),
                    template: {
                        content: "{Maktx}"
                    }
                },
                {
                    name: texts.getProperty("/rem.quantity"),
                    template: {
                        content: "{Menge}"
                    }
                },
                {
                    name: texts.getProperty("/rem.netcost"),
                    template: {
                        content: "{Bprei}"
                    }
                },
                {
                    name: texts.getProperty("/rem.totalcost"),
                    template: {
                        content: "{Bwert}"
                    }
                },
                {
                    name: texts.getProperty("/rem.currency"),
                    template: {
                        content: "{Waers}"
                    }
                }
            ];

            if (Encabezado.getProperty("/Eremh/Ztipoentreg") == 'Reverse') {
                columns.splice(
                    columns.findIndex(
                        element =>
                            element.name == texts.getProperty("/rem.palletbox")
                    ),
                    1
                );
            }

            this.exportxls('tableRemissionDetail', '/ETREMDNAV/results', columns);
        },
        hancleCandel: function (remisionNo) {
            sap.m.MessageBox["confirm"](this.getView().getModel("appTxts").getProperty("/rem.cancelRemission"), {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        this.cancelRemission(remisionNo);
                    }
                }.bind(this)
            });
        },
        cancelRemission: function (remisionNo) {
            var cObj = {
                "RemFolio": remisionNo,
                "Success": "",
                "Error": ""
            };

            var url = `/AvisoCancSet`;

            var response = cModel.create(url, cObj);

            if (response != null) {
                if (response.Success == "X") {
                    sap.m.MessageBox.success(this.getOwnerComponent().getModel("appTxts").getProperty("/rem.msgCancelDone"));
                } else {
                    sap.m.MessageBox.error(response.Error);
                }
            }
        },
        printLabels: function () {

            /*
            if (!this._uploadDialog2) {
                this._uploadDialog2 = sap.ui.xmlfragment("printBoxesLabels", "demo.views.Remissions.fragments.LabelsRemission", this);
                this.getView().addDependent(this._uploadDialog2);
            }

            var ojbResponse = {};

            var html = "";

            html = '<div id="codeGroupDiv" style= "text-align: center; width: 100%;" >' +
                '<div style="display: grid;grid-template-columns: auto auto auto; width:40%;">';
                */

            var positions = this.getView().getModel("tableRemissionDetail").getData();
            console.log(positions.ETREMDNAV.results)

            if (positions.ETREMDNAV.results != null) {

                var cajsTarimas = this.groupByAuto(positions.ETREMDNAV.results, "Cajtar")
                var aCajasTarimas = [];
                /*
                let cajTarIndex = 1;
                let count = 0;
                for (const key in cajsTarimas) {
                    count ++;
                    html += '<div style="padding:5px;display:inline; margin-top:40px; margin-right:10px; margin-left:10px; border:1px solid #999999;text-align:center;">' +
                        `<p style="width:100%;font-size: smaller;">${positions.Eremh.Zremision}</p>` +
                        `<p style="width:100%;font-size: smaller;">${this.getConfigModel().getProperty("/supplierInput")}</p>` +
                        `<p style="width:100%;font-size: smaller;">${cajsTarimas[key][0].Werks} - ${cajsTarimas[key][0].Name1}</p>` +
                        '<svg class="barcode"' +
                        `jsbarcode-value="${key}"` +
                        'jsbarcode-textmargin="0"' +
                        'jsbarcode-fontoptions="bold" jsbarcode-width="2" jsbarcode-fontSize="12">' +
                        '</svg>' +
                        `<p style="width:60%; text-align:left; font-size: smaller;">${this.getView().getModel("appTxts").getProperty("/rem.palletbox")}: ${cajTarIndex} de ${Object.keys(cajsTarimas).length}</p>` +
                        '</div>';
                    cajTarIndex++;
                    if (count === 6){
                        count = 0;
                        html += '<br><br><br> <br><br><br> <br><br><br> <br><br><br>';
                    }
                }
                */
                for (const key in cajsTarimas) {
                    var cajaTarima = {
                        Remision: cajsTarimas[key][0].Zremision,
                        Lifnr: this.getConfigModel().getProperty("/supplierInputKey"),
                        Nlifnr: this.getConfigModel().getProperty("/supplierInput"),
                        Werks: cajsTarimas[key][0].Werks,
                        Nwerks: cajsTarimas[key][0].Name1,
                        Ean11: cajsTarimas[key][0].Ean11
                    }
                    aCajasTarimas.push(cajaTarima)
                }

                /*
                this.etiquetasModel.create("", {
                    success: function(response){
                        console.log(response)
                    }, 
                    error: function(error){
                        //sap.m.MessageBox.error(that.getOwnerComponent().getModel("appTxts").getProperty("/dashboard.catalog.tipos"));
                        console.log(error)
                    }
                });
                */

                var response = oEtiquetas.create("", JSON.stringify({Esetiq: aCajasTarimas}));
                console.log(response)
            }

            /*
            html += '</div></div>';

            ojbResponse.html = html;

            this._uploadDialog2.setModel(new JSONModel(ojbResponse));
            this._uploadDialog2.open();
            JsBarcode(".barcode").init();
            */
        },
        groupByAuto: function (data, key) {
            var groups = {};
            for (var i in data) {
                if (!groups.hasOwnProperty(data[i][key])) groups[data[i][key]] = [];
                groups[data[i][key]].push(data[i]);
            }
            return groups;
        },
        onCloseDialogBoxPrint: function () {
            if (this._uploadDialog2) {
                this._uploadDialog2.destroy();
                this._uploadDialog2 = null;
            }
        },
        saveCoordinates: function () {
            var element = document.getElementById('codeGroupDiv');
            var opt = {
                margin: 0,
                filename: 'GroupCode.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape'},//, orientation: 'landscape' 
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // New Promise-based usage:
            html2pdf().set(opt).from(element).save();
            //element.innerHTML = "";
        },
        printConsolidated: function () {
            if (!this._uploadDialog2) {
                this._uploadDialog2 = sap.ui.xmlfragment("printBoxesLabels", "demo.views.Remissions.fragments.DetailConsolidated", this);
                this.getView().addDependent(this._uploadDialog2);
            }

            var positions = this.getView().getModel("tableRemissionDetail").getData();

            var ojbResponse = {
                "cajtars": []
            };
            ojbResponse.supplier = this.getConfigModel().getProperty("/supplierInput");
            ojbResponse.remisionNo = positions.Eremh.Zremision;

            if (positions.ETREMDNAV.results != null) {

                var cajsTarimas = this.groupByAuto(positions.ETREMDNAV.results, "Cajtar");

                for (const key in cajsTarimas) {
                    var caj = {
                        "Cajtar": key,
                        "Werks": cajsTarimas[key][0].Werks,
                        "Name1": cajsTarimas[key][0].Name1,
                        "items": cajsTarimas[key]
                    };

                    ojbResponse.cajtars.push(caj);
                }

            }

            this._uploadDialog2.setModel(new JSONModel(ojbResponse));
            this._uploadDialog2.open();
            JsBarcode(".barcode").init();
        },
        printDetailConsolidated: function () {
            var element = document.getElementById('printBoxesLabels--consolidatedDetail');
            var opt = {
                margin: 0,
                filename: 'GroupCode.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // New Promise-based usage:
            html2pdf().set(opt).from(element).save();
            element.clear();
        },
    });
});
