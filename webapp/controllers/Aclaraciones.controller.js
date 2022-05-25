sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/f/library',
    "sap/ui/table/RowAction",
    "sap/ui/table/RowActionItem",
    "sap/ui/table/RowSettings",
], function (BaseController, Controller, JSONModel, fioriLibrary, RowAction, RowActionItem, RowSettings) {
    "use strict";



    var sUri = "/sap/opu/odata/sap/ZOSP_ACLARA_SRV/";


    return BaseController.extend("demo.controllers.Aclaraciones", {

        onInit: function () {
            //this.setDaterangeMaxMin();


            let url = `EAclaHdrSet?$expand=ZtaclaraSt,ZtaclaraTa&$filter=IOption eq '7'&$format=json`;


            let oODataJSONModel = this.getOdata(sUri);

            let oDataJSONModel = this.getOdataJsonModel(url, oODataJSONModel);
            let dataJSON = oDataJSONModel.getJSON();
            let Datos = JSON.parse(dataJSON);

            let Catalogos = {
                'Estatus': {
                    results: [...Datos.results[0].ZtaclaraSt.results]
                },
                'Tipos': {
                    results: [...Datos.results[0].ZtaclaraTa.results]
                },
                'sizeFilesUpload':Datos.results[0].ITamarchivo
            };



            this.getOwnerComponent().setModel(new JSONModel(Catalogos), "catalogos");
            sap.ui.getCore().setModel(new JSONModel(JSON.parse(JSON.stringify(Catalogos))), "catalogos_base");

            //console.log( this.getOwnerComponent().getModel('userdata').getJSON() );


            this.getView().addEventDelegate({
                onBeforeShow: function (oEvent) {
                    this.getOwnerComponent().setModel(new JSONModel(), "Aclaraciones");
                    this.clearFilters();
                }
            }, this);

        },
        searchData: function () {

            if (!this.hasAccess(18)) {
                return false;
            }
            var dateRange = this.getView().byId("dateRange");
            var comboStatus = this.getView().byId("comboStatus");
            var inputFolioTxt = this.getView().byId("inputFolioTxt");


            let folio = inputFolioTxt.getValue();
            //let folio = "1";
            let status = comboStatus.getSelectedKey();
            //let status = 'A';

            //let proveedor_LIFNR = 21;
            let proveedor_LIFNR = (this.getConfigModel().getProperty("/supplierInputKey") != undefined) ? this.getConfigModel().getProperty("/supplierInputKey") : '';
            // format[AAAAMMDD] (2020101)
            let IStartdate = this.buildSapDate(dateRange.getDateValue());
            // format[AAAAMMDD] (2020101)
            let IEnddate = this.buildSapDate(dateRange.getSecondDateValue());
            let IIdusua = this.getOwnerComponent().getModel("userdata").getProperty('/EIdusua');
            //let IIdusua = '';
            //console.log(this.getOwnerComponent().getModel("userdata").getJSON());

            if (folio === '' && status == '' && proveedor_LIFNR == '' && dateRange.getValue() == '') {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.msgNoFilter'));
                return false;
            }



            let filtros = [`IOption eq '4'`];

            if( String(folio).trim() != '' ){
                filtros.push(`IFolio eq '${folio}'`);
            }
            else{
                filtros.push(`IFechai eq '${IStartdate}' and IFechaf eq '${IEnddate}'`);
                if (status != '') filtros.push(`IStatus eq '${status}'`);
            }

            if (String(IIdusua).trim() != '') filtros.push(`IIdusua eq '${IIdusua}'`);
            
            if (proveedor_LIFNR != '' && !this.getView().byId("colSor").getSelected() ) filtros.push(`ILifnr eq '${proveedor_LIFNR}'`);
            

            filtros = filtros.join(' and ');

            // let url = `HeaderPYMNTCSet?$expand=EPYMNTDOCSNAV,EPYMNTPRGRMNAV&$filter= IOption eq '2' and ILifnr eq '${proveedor_LIFNR}' and IStartdate eq '${IStartdate}'  and IEnddate eq '${IEnddate}'&$format=json`;
            let url = `EAclaHdrSet?$expand=ZtaclaUp,ZtaclaraFo,ZtaclaraFd,ZtaclaraDo&$filter=${filtros}&$format=json`;


            let oODataJSONModel = this.getOdata(sUri);

            let oDataJSONModel = this.getOdataJsonModel(url, oODataJSONModel);
            let dataJSON = oDataJSONModel.getJSON();
            let Datos = JSON.parse(dataJSON);



            var Aclaraciones = { Detalles: { results: [...Datos.results[0].ZtaclaraFo.results] } };

            if (folio !== '' && Datos.results[0].ZtaclaraFo.results.length == 1) {
                this.getView().byId("comboStatus").setSelectedKey(Datos.results[0].ZtaclaraFo.results[0].Estatus);
                //this.getView().byId("supplierInput").setValue( Datos.results[0].ZtaclaraFo.results[0].Lifnr);
            }



            this.getOwnerComponent().setModel(new JSONModel(Aclaraciones), "Aclaraciones");

            this.paginate("Aclaraciones", "/Detalles", 1, 0);

            this.genereteRowAction();

        },
        clearFilters: function () {
            this.getView().byId("inputFolioTxt").setValue('');
            this.getView().byId("comboStatus").setSelectedKey('');
            this.getView().byId("dateRange").setValue('');
        },
        newClarification: function () {
            if (!this.hasAccess(19)) {
                return false;
            }
            this.getOwnerComponent().getRouter().navTo("detailAclaracion", { layout: sap.f.LayoutType.MidColumnFullScreen, document: '0', modo: 'new', tipo:'01' }, true);
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
        genereteRowAction: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");

            var oTable = this.byId("aclaracionesList");

            var oTemplate = oTable.getRowActionTemplate();
            if (oTemplate) {
                oTemplate.destroy();
                oTemplate = null;
            }



            oTemplate = new RowAction({
                items: [
                    new RowActionItem({ icon: "sap-icon://detail-view", text: texts.getProperty("/global.view"), press: (Event) => this.viewClarification(Event) }),
                    new RowActionItem({ icon: "sap-icon://edit", text: texts.getProperty("/global.edit"), press: (Event) => this.editClarification(Event) }),
                ]
            });


            oTable.setRowActionTemplate(oTemplate);
            oTable.setRowActionCount(2);
        },
        viewClarification: function (oEvent) {

            

            let resource = oEvent.getSource().getBindingContext("Aclaraciones").getPath();
            let line = resource.split("/").slice(-1).pop();

            let odata = this.getOwnerComponent().getModel("Aclaraciones");
            let results = odata.getProperty("/Detalles/Paginated/results");

            this.getOwnerComponent().getRouter().navTo("detailAclaracion", { layout: fioriLibrary.LayoutType.MidColumnFullScreen, document: results[line].Folio, modo: 'view', tipo: results[line].TipAcla}, true);

        },
        editClarification: function (oEvent) {
            if (!this.hasAccess(20)) {
                return false;
            }

            let Rol = this.getOwnerComponent().getModel("userdata").getProperty('/ERol');

            let resource = oEvent.getSource().getBindingContext("Aclaraciones").getPath();
            let line = resource.split("/").slice(-1).pop();

            let odata = this.getOwnerComponent().getModel("Aclaraciones");
            let results = odata.getProperty("/Detalles/Paginated/results");

            let continuar = true;
            let Estatus = results[line].Estatus;
            switch (Estatus) {
                case 'A':
                    
                    break;
                case 'B':
                    continuar = ( Rol === '0001' || Rol === '0004' || Rol === '0005' );
                    break;
                case 'C':
                    continuar = ( Rol === '0001' || Rol === '0004' || Rol === '0005' );
                    break;
                case 'D':
                    continuar = ( Rol === '0002' || Rol === '0003' );
                    break;
                case 'E':
                    continuar = ( Rol === '0001' || Rol === '0004' || Rol === '0005' );
                    break;
                case 'G':
                    continuar = ( Rol === '0001' || Rol === '0004' || Rol === '0005' );
                    break;
                case 'H':
                default:
                    continuar = false;
                    break;
            }

            if( !continuar ){
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.noEditMsg'));
                return false;
            }
            this.getOwnerComponent().getRouter().navTo("detailAclaracion", { layout: fioriLibrary.LayoutType.MidColumnFullScreen, document: results[line].Folio, modo: 'edit', tipo: results[line].TipAcla }, true);
        },
        buildExportTable: function () {
            var texts = this.getOwnerComponent().getModel("appTxts");

            var columns = [
                {
                    name: texts.getProperty("/clarifications.headerFolioUPC"),
                    template: {
                        content: "{Folio}"
                    }
                },
                {
                    name: texts.getProperty("/clarifications.headerDateUPC"),
                    template: {
                        content: "{FAlta}"
                    }
                },
                {
                    name: texts.getProperty("/clarifications.headerSupplierUPC"),
                    template: {
                        content: "{Lifnr}"
                    }
                },
                {
                    name: texts.getProperty("/clarifications.headerTypeUPC"),
                    template: {
                        content: "{DesAcla}"
                    }
                },
                {
                    name: texts.getProperty("/clarifications.headerInvoiceUPC"),
                    template: {
                        content: "{Factura}"
                    }
                },
                {
                    name: texts.getProperty("/clarifications.headerReclaimedAmountUPC"),
                    template: {
                        content: "{MonRec}"
                    }
                },
                {
                    name: texts.getProperty("/clarifications.headerReclaimedTaxesUPC"),
                    template: {
                        content: "{IvaRec}"
                    }
                },
                {
                    name: texts.getProperty("/clarifications.headerStatusUPC"),
                    template: {
                        content: "{DesStatus}"
                    }
                },
                {
                    name: texts.getProperty("/clarifications.headerAnalystUPC"),
                    template: {
                        content: "{Analista}"
                    }
                },
                {
                    name: texts.getProperty("/clarifications.headerAssignmentDateUPC"),
                    template: {
                        content: "{FAlta}"
                    }
                },
                {
                    name: texts.getProperty("/clarifications.headerAssignmentTimeUPC"),
                    template: {
                        content: "{HAlta}"
                    }
                },
                {
                    name: texts.getProperty("/clarifications.headerSolutionDateUPC"),
                    template: {
                        content: "{FVenc}"
                    }
                },
                {
                    name: texts.getProperty("/clarifications.headerClearedAmountUPC"),
                    template: {
                        content: "{MonAcla}"
                    }
                },
                {
                    name: texts.getProperty("/clarifications.headerClearedTaxesUPC"),
                    template: {
                        content: "{IvaAcla}"
                    }
                },
                {
                    name: texts.getProperty("/clarifications.headerPaymentUPC"),
                    template: {
                        content: "{NoDoc}"
                    }
                }
            ];

            this.exportxls('Aclaraciones', '/Detalles/results', columns);
        },
        onSelectColaborator: function(){
            this.getView().byId("supplierInput").setEditable( !this.getView().byId("colSor").getSelected() )
        },
        paginar : function(selectedItem){
                
            let totalRegistros = parseInt( this.getOwnerComponent().getModel('Aclaraciones').getProperty('/Detalles/results/length'), 10);
            let valorSeleccinado = parseInt( selectedItem.getKey(), 10);
            
            let tablaPrincipal = this.getView().byId("aclaracionesList");
            tablaPrincipal.setVisibleRowCount( totalRegistros < valorSeleccinado ? totalRegistros : valorSeleccinado );
            this.paginateValue(selectedItem, 'Aclaraciones', '/Detalles');
        }
        /*,
		cargaParams: function () {
			var view = this.getView().getId();
			
			for(var i = 0; i < jsonAclaracion.results.length; i++){
				if(jsonAclaracion.results[i].cerrada === true){
					sap.ui.getCore().getControl(view + "--celStatus-" + view + "--idTableAcla-" + i).setSelected(true);
				}else{ 
					sap.ui.getCore().getControl(view + "--celStatus-" + view + "--idTableAcla-" + i).setSelected(false);
				}
			}
			
		},
		onSelectStatus: function (oEvent) {
			var sUri = "/sap/opu/odata/sap/ZMMPORTAL_VERIFICACION_SRV/";
			var ubicaId = oEvent.getSource().getId();
			ubicaId = ubicaId.replace("celStatus", "celIdAcla");
			var id = sap.ui.getCore().getControl(ubicaId).getText();
			var cerrar =  oEvent.getSource().getSelected();
			var that = this;
			
			var oNewParams = new sap.ui.model.odata.ODataModel(sUri, true);

			var oEntry = {};
			oEntry.id = id;
			if(cerrar === true){
				oEntry.cerrar = "X";
			}else{
				oEntry.cerrar = "";
			}
			
			if (oEntry) {
				oNewParams.setHeaders({
					"X-Requested-With": "X"
				});
				oNewParams.create("/cerrarAclaracionSet", oEntry, null, function() {
					sap.m.MessageBox.success(that.getOwnerComponent().getModel('appTxts').getProperty("/clarificationsCon.status"));
				}, function(error) {
					sap.m.MessageBox.error(that.getOwnerComponent().getModel('appTxts').getProperty("/clarificationsCon.error"));
				});
			}
		},
		onExit: function() {
			if (this._oDialog) {
				this._oDialog.destroy();
				this._oDialog = null;
			}

			if (this._uploadDialog1) {
				this._uploadDialog1.destroy();
				this._uploadDialog1 = null;
			}
			
			if (this._uploadDialog2) {
				this._uploadDialog2.destroy();
				this._uploadDialog2 = null;
			}

			if (this._oPopover) {
				this._oPopover.destroy();
				this._oPopover = null;
			}
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
			
			var list = this.getView().byId("idTableAcla");
			var binding = list.getBinding("items");
			binding.filter(filterCustomer);
		}
*/
        ,
        formatStatus: function (idStatus) {
            var strStatus = "";

            if (idStatus != null) {
                var catStatus = this.getOwnerComponent().getModel("catalogos");
                if (catStatus != null) {
                    var statuses = catStatus.getProperty("/Estatus/results");
                    if (statuses != null) {
                        var status = statuses.find(element => element.Status == idStatus);

                        strStatus = status.Descripcion;
                    }
                }
            }

            return strStatus;
        }
    });

});