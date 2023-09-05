sap.ui.define([
    "demo/controllers/BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/f/library',
    "sap/ui/table/RowAction",
    "sap/ui/table/RowActionItem",
    "sap/ui/table/RowSettings",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
], function (BaseController, Controller, JSONModel, fioriLibrary, RowAction, RowActionItem, RowSettings, exportLibrary, Spreadsheet) {
    "use strict";

    var EdmType = exportLibrary.EdmType;

    var sUri = "/sap/opu/odata/sap/ZOSP_ACLARA_SRV/";


    return BaseController.extend("demo.controllers.Aclaraciones", {

        onInit: function () {
            //this.setDaterangeMaxMin();
            this.ValidateDevice();

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
                'sizeFilesUpload': Datos.results[0].ITamarchivo
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

           
            console.log(this.getView().byId("dateRangeAcl").getDateValue())
           
            
            

        },
/* Validacion para activar  boton nueva Aclaracion*/
ValidateNAc:function(){
    var that= this;
if (that.getView().byId("supplierInput").getValue()===""){
    that.getView().byId("NewClarification").setEnabled(false);
}else{
    that.getView().byId("NewClarification").setEnabled(true);
}
},

        /*Validacion de vista **/
        ValidateDevice: function () {
            var that = this;
            if (navigator.userAgent.match(/Android/i)
                || navigator.userAgent.match(/webOS/i)
                || navigator.userAgent.match(/iPhone/i)
                || navigator.userAgent.match(/iPad/i)
                || navigator.userAgent.match(/iPod/i)
                || navigator.userAgent.match(/BlackBerry/i)
                || navigator.userAgent.match(/Windows Phone/i)) {
	that.oModel = new JSONModel({
				idfolio: true,
				idFAlta: true,
				idlifnr: false,
				idDesAcla: false,
				idFactura: false,
				idMonRec: false,
				idIvaRec: false,
				
				idAnalista: false,
                idEstatus2:false,
				idFAlta2: false,
				idHalta: false,
				idFvenc: false,
				idMonacla: false,
				idivaacla: false,
				idNdoc: false,
				

			});
            }else{
            	that.oModel = new JSONModel({
				idfolio: true,
				idFAlta: true,
				idlifnr: true,
				idDesAcla: true,
				idFactura: true,
				idMonRec: false,
				idIvaRec: false,
				
				idAnalista: false,
                idEstatus2: false,
				idFAlta2: false,
				idHalta: false,
				idFvenc: false,
				idMonacla: false,
				idivaacla: false,
				idNdoc: false,
				

			});
        
            }

			that.getView().setModel(that.oModel);
			that.TableVisible()

           
        },
        onAfterRendering:function(){
            console.log(this.getView().byId("dateRangeAcl").getDateValue())
    var Fecha= new Date();
  
    Fecha = (Fecha.getTime() - (1000*60*60*24*60))
  
 this.getView().byId("dateRangeAcl").setDateValue(new Date(Fecha));
 this.getView().byId("dateRangeAcl").setSecondDateValue(new Date());
},
onChange:function(){
    
  
   
  var fecha_inicio= this.getView().byId("dateRangeAcl").getDateValue();
  var fecha_fin=this.getView().byId("dateRangeAcl").getSecondDateValue();
 var Fecha = (fecha_inicio.getTime() - fecha_fin.getTime())
 console.log((Math.round(Fecha / (1000*60*60*24)))*-1)
 if ((Math.round(Fecha / (1000*60*60*24)))*-1 > 60){
    sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.ValidacionMens'));
    var Fecha= new Date();
  
    Fecha = (Fecha.getTime() - (1000*60*60*24*30))
    this.getView().byId("dateRangeAcl").setDateValue(new Date(Fecha));
 this.getView().byId("dateRangeAcl").setSecondDateValue(new Date());
    return false;
    

 }
},
        ConfigTable: function() {
            var that= this;
			var oDialog = that.getView().byId("dinamicTable");

			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(that.getView().getId(), "demo.views.Aclaraciones.fragments.option", this);
				that.getView().addDependent(oDialog);
				that.getView().byId("dinamicTable").addStyleClass(that.getOwnerComponent().getContentDensityClass());

			}

			oDialog.open();
		},
		ClosepopUp: function() {
             var that= this;
			that.TableVisible();
			that.getView().byId("dinamicTable").close();
		},
		onParentClicked: function(oEvent) {
			var bSelected = oEvent.getParameter("selected");
			this.oModel.setData({
				idfolio: bSelected,
				idFAlta: bSelected,
				idlifnr: bSelected,
				idDesAcla: bSelected,
				idFactura: bSelected,
				idMonRec: bSelected,
				idIvaRec: bSelected,
				
				idAnalista: bSelected,
                idEstatus2:bSelected,
				idFAlta2: bSelected,
				idHalta: bSelected,
				idFvenc: bSelected,
				idMonacla: bSelected,
				idivaacla: bSelected,
				idNdoc: bSelected
				
			});
		},
		TableVisible: function() {
   var that= this;
 
                that.getView().byId("idfolio").setVisible(that.getView().getModel().getProperty("/idfolio"));
                that.getView().byId("idFAlta").setVisible(that.getView().getModel().getProperty("/idFAlta"));
                that.getView().byId("idlifnr").setVisible(that.getView().getModel().getProperty("/idlifnr"));
                that.getView().byId("idDesAcla").setVisible(that.getView().getModel().getProperty("/idDesAcla"));
                that.getView().byId("idFactura").setVisible(that.getView().getModel().getProperty("/idFactura"));
                that.getView().byId("idMonRec").setVisible(that.getView().getModel().getProperty("/idMonRec"));
                that.getView().byId("idIvaRec").setVisible(that.getView().getModel().getProperty("/idIvaRec"));
               
                that.getView().byId("idAnalista").setVisible(that.getView().getModel().getProperty("/idAnalista"));
                that.getView().byId("idEstatus2").setVisible(that.getView().getModel().getProperty("/idEstatus2"));
                that.getView().byId("idFAlta2").setVisible(that.getView().getModel().getProperty("/idFAlta2"));
                that.getView().byId("idHalta").setVisible(that.getView().getModel().getProperty("/idHalta"));
                that.getView().byId("idFvenc").setVisible(that.getView().getModel().getProperty("/idFvenc"));
                that.getView().byId("idMonacla").setVisible(that.getView().getModel().getProperty("/idMonacla"));
                that.getView().byId("idivaacla").setVisible(that.getView().getModel().getProperty("/idivaacla"));
                that.getView().byId("idNdoc").setVisible(that.getView().getModel().getProperty("/idNdoc"));
			

		},


        searchData: function () {

            if (!this.hasAccess(18)) {
                return false;
            }
            var dateRange = this.getView().byId("dateRangeAcl");
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

         /*   if (proveedor_LIFNR === '') {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.msgNoFilter'));
                return false;
            }*/



            let filtros = [`IOption eq '4'`];

            if (String(folio).trim() != '') {
                filtros.push(`IFolio eq '${folio}'`);
            }
            else {
                filtros.push(`IFechai eq '${IStartdate}' and IFechaf eq '${IEnddate}'`);
                if (status != '') filtros.push(`IStatus eq '${status}'`);
            }

            if (String(IIdusua).trim() != '') filtros.push(`IIdusua eq '${IIdusua}'`);

            if (proveedor_LIFNR != '' && !this.getView().byId("colSor").getSelected()) filtros.push(`ILifnr eq '${proveedor_LIFNR}'`);


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
            this.getView().byId("dateRangeAcl").setValue('');
        },
        newClarification: function () {
            var that= this;
            if (that.getView().byId("supplierInput").getValue()===""){
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.noSupplier'));
            }else{
                if (!this.hasAccess(19)) {
                    return false;
                }
                this.getOwnerComponent().getRouter().navTo("detailAclaracion", { layout: sap.f.LayoutType.MidColumnFullScreen, document: '0', modo: 'new', tipo: '01' }, true);
           
            }
           },
     /*   setDaterangeMaxMin: function () {
            var datarange = this.getView().byId('dateRangeAcl');
            var date = new Date();
            var minDate = new Date();
            var minConsultDate = new Date();
            minConsultDate.setDate(date.getDate() - 7);
            minDate.setDate(date.getDate() - 30);
            datarange.setSecondDateValue(date);
            datarange.setDateValue(minConsultDate);
        },*/
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

            this.getOwnerComponent().getRouter().navTo("detailAclaracion", { layout: fioriLibrary.LayoutType.MidColumnFullScreen, document: results[line].Folio, modo: 'view', tipo: results[line].TipAcla }, true);


            
        },
        editClarification: function (oEvent) {
            if (!this.hasAccess(20)) {
                return false;
            }

            let Rol = this.getOwnerComponent().getModel("userdata").getProperty('/ERol');
            console.log(Rol)

            let resource = oEvent.getSource().getBindingContext("Aclaraciones").getPath();
            let line = resource.split("/").slice(-1).pop();

            let odata = this.getOwnerComponent().getModel("Aclaraciones");
            let results = odata.getProperty("/Detalles/Paginated/results");

            let continuar = true;
            let Estatus = results[line].Estatus;
            console.log(Estatus)
            /*switch (Estatus) {
                case 'A':

                    break;
                case 'B':
                    continuar = (Rol === '0001' || Rol === '0004' || Rol === '0005');
                    break;
                case 'C':
                    continuar = (Rol === '0001' || Rol === '0004' || Rol === '0005');
                    break;
                case 'D':
                    continuar = (Rol === '0002' || Rol === '0003');
                    break;
                case 'E':
                    continuar = (Rol === '0001' || Rol === '0004' || Rol === '0005');
                    break;
                case 'G':
                    continuar = (Rol === '0001' || Rol === '0004' || Rol === '0005');
                    break;
                case 'H':
                default:
                    continuar = false;
                    break;
            }*/
            if(Estatus==='H'){
                continuar = false;

            }

            if (!continuar) {
                sap.m.MessageBox.error(this.getOwnerComponent().getModel("appTxts").getProperty('/clarifications.noEditMsg'));
                return false;
            }
            this.getOwnerComponent().getRouter().navTo("detailAclaracion", { layout: fioriLibrary.LayoutType.MidColumnFullScreen, document: results[line].Folio, modo: 'edit', tipo: results[line].TipAcla }, true);
        },
     
        createColumnConfig: function () {
            var that = this;
            var oModel = that.getView().getModel("Aclaraciones").getData(),
                aCols = [];
            console.log(oModel);
            var texts = this.getOwnerComponent().getModel("appTxts");

            aCols.push({
                label: texts.getProperty("/clarifications.headerFolioUPC"),
                type: EdmType.String,
                property: 'Folio'
            });

            aCols.push({
                label: texts.getProperty("/clarifications.headerDateUPC"),
                type: EdmType.String,
                property: 'FAlta'
            });
            aCols.push({
                label: texts.getProperty("/clarifications.headerSupplierUPC"),
                type: EdmType.String,
                property: 'Lifnr'
            });

            //****
            aCols.push({
                label: texts.getProperty("/clarifications.headerTypeUPC"),
                type: EdmType.String,
                property: 'DesAcla'
            });

            aCols.push({
                label: texts.getProperty("/clarifications.headerInvoiceUPC"),
                type: EdmType.String,
                property: 'Factura'
            });

            aCols.push({
                label: texts.getProperty("/clarifications.headerReclaimedAmountUPC"),
                type: EdmType.String,
                property: 'MonRec'


            });

            aCols.push({
                label: texts.getProperty("/clarifications.headerReclaimedTaxesUPC"),
                type: EdmType.String,
                property: 'IvaRec'
            });

            aCols.push({
                label: texts.getProperty("/clarifications.headerStatusUPC"),
                type: EdmType.String,
                property: 'DesStatus'
            });

            aCols.push({
                label: texts.getProperty("/clarifications.headerAnalystUPC"),
                type: EdmType.String,
                property: 'Analista'
            });

            aCols.push({
                label: texts.getProperty("/clarifications.headerAssignmentDateUPC"),
                type: EdmType.String,
                property: 'FAlta'
            });

            aCols.push({
                label: texts.getProperty("/clarifications.headerAssignmentTimeUPC"),
                type: EdmType.String,
                property: 'HAlta'
            });

            aCols.push({
                label: texts.getProperty("/clarifications.headerSolutionDateUPC"),
                type: EdmType.String,
                property: 'FVenc'
            });

            aCols.push({
                label: texts.getProperty("/clarifications.headerClearedAmountUPC"),
                type: EdmType.String,
                property: 'MonAcla'
            });

            aCols.push({
                label: texts.getProperty("/clarifications.headerSupplierUPC"),
                type: EdmType.String,
                property: 'IvaAcla'
            });

            aCols.push({
                label: texts.getProperty("/clarifications.headerPaymentUPC"),
                type: EdmType.String,
                property: 'NoDoc'
            });



            console.log(aCols);
            return aCols;
        },
        //exporta excel
        buildExportTable: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable, that = this;

            if (!that._oTable) {
                that._oTable = this.getOwnerComponent().getModel('Aclaraciones').getProperty('/Detalles/results');
            }
            //cambios 08-06
            console.log()

            oTable = this.getOwnerComponent().getModel('Aclaraciones').getProperty('/Detalles/results');
            console.log(oTable);
            //oRowBinding = oTable.getBinding('items');
            //oRowBinding = oTable.getBinding('rows');
            oRowBinding = oTable //.getBinding().oList;

            aCols = that.createColumnConfig();

            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Aclaraciones',
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },

        onSelectColaborator: function () {
            this.getView().byId("supplierInput").setEditable(!this.getView().byId("colSor").getSelected())
        },
        paginar: function (selectedItem) {

            let totalRegistros = parseInt(this.getOwnerComponent().getModel('Aclaraciones').getProperty('/Detalles/results/length'), 10);
            let valorSeleccinado = parseInt(selectedItem.getKey(), 10);

            let tablaPrincipal = this.getView().byId("aclaracionesList");
            tablaPrincipal.setVisibleRowCount(totalRegistros < valorSeleccinado ? totalRegistros : valorSeleccinado);
            this.paginateValue(selectedItem, 'Aclaraciones', '/Detalles');
        },
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