sap.ui.define([
	"demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
    "demo/models/BaseModel"
], function (Controller, JSONModel) {
	"use strict";
	
	var sUri = "/sap/opu/odata/sap/ZOSP_STATEMENT_SRV_01/";
	var dTJSON;
    var fechaAct = new Date();
	return Controller.extend("demo.controllers.Statement.EstadoCuenta", {

		onInit: function () {
            

            //this.searchData();
			this.getView().addEventDelegate({
				onBeforeShow: function (oEvent) {
					/*var oModel = new JSONModel();
					oModel.setData({
						maxDate: new Date(fechaAct.getFullYear(), fechaAct.getMonth(), fechaAct.getDate()),
						disabled: [{start: new Date(fechaAct.getFullYear(), fechaAct.getMonth(), fechaAct.getDate() + 1), end: new Date(fechaAct.getFullYear(), fechaAct.getMonth(), fechaAct.getDate() + 10)},
								   {start: new Date(fechaAct.getFullYear(), fechaAct.getMonth(), fechaAct.getDate() + 15)}
								  ]
					});
                    this.getView().setModel(oModel);*/
                    this.clearFilters();
                    this.getOwnerComponent().setModel(new JSONModel(), "totales");
                    
				}
			}, this);
		},
		searchData: function (){
            
            let dateRange = this.getView().byId("dateRange");

            let proveedor_LIFNR = this.getConfigModel().getProperty("/supplierInputKey");
            // format[AAAAMMDD] (2020101)
            let desde_LV_ZDESDE = this.buildSapDate( dateRange.getDateValue()       ); 
            // format[AAAAMMDD] (2020101)
            let desde_LV_ZHASTA = this.buildSapDate( dateRange.getSecondDateValue() );

            //checbox

             let partidasFiltro = this.getView().byId("checkPartidas");

             if(partidasFiltro.getSelected()){
                 partidasFiltro.setSelected(false);
             }


            if (proveedor_LIFNR == null || proveedor_LIFNR == "") {
                sap.m.MessageBox.error("El campo proveedor es obligatorio.");
                return false;
            } 

            if (desde_LV_ZDESDE == "" || desde_LV_ZHASTA == "") {
                sap.m.MessageBox.error("Por favor defina el rango de fechas.");
            } 

            
            var oODataJSONModel = this.getOdata(sUri);
            let urlParams = `EStmtHdrSet?$expand=Citms,Oitms&$filter= Lifnr eq '${proveedor_LIFNR}' and Datei eq '${desde_LV_ZDESDE}' and Datef eq '${desde_LV_ZHASTA}'&$format=json`;

			var odTJSONModel = this.getOdataJsonModel( urlParams, oODataJSONModel );
			dTJSON = odTJSONModel.getJSON();
            var TDatos = JSON.parse(dTJSON);

            let Detalles = [ ...TDatos.results[0].Citms.results, ...TDatos.results[0].Oitms.results ];

            TDatos.results[0].Detalles = {results : [ ...Detalles ] };
            
            delete TDatos.results[0].Citms;
            delete TDatos.results[0].Oitms;

			
            TDatos.results[0].periodo = "Del " + this.formatDateTime( dateRange.getDateValue(), 'dd/MM/YYYY') + " al " + this.formatDateTime(dateRange.getSecondDateValue(), 'dd/MM/YYYY');
            

			var JSONT = $.extend({}, TDatos.results[0]);
			var jsonModelT = new JSONModel();
			jsonModelT.setData(JSONT);
			this.getOwnerComponent().setModel(jsonModelT, "totales");
            
            this.paginate("totales", "/Detalles", 1, 0);
			
        },

         subtractYears: function (numOfYears, date = new Date()) {
  date.setFullYear(date.getFullYear() - numOfYears);

  return date;
},


            searchPartidasAbiertas: function (){
            
            let dateRange = this.getView().byId("dateRange");
            let todayDate = new Date();

            let proveedor_LIFNR = this.getConfigModel().getProperty("/supplierInputKey");
            // format[AAAAMMDD] (2020101)
            let desde_LV_ZDESDE = this.buildSapDate( this.subtractYears(1)    ); 
            // format[AAAAMMDD] (2020101)
            let desde_LV_ZHASTA = this.buildSapDate( todayDate );

           

            if (proveedor_LIFNR == null || proveedor_LIFNR == "") {
                sap.m.MessageBox.error("El campo proveedor es obligatorio.");
                return false;
            } 

            if (desde_LV_ZDESDE == "" || desde_LV_ZHASTA == "") {
                sap.m.MessageBox.error("Por favor defina el rango de fechas.");
            } 

            
            var oODataJSONModel = this.getOdata(sUri);
            let urlParams = `EStmtHdrSet?$expand=Citms,Oitms&$filter= Lifnr eq '${proveedor_LIFNR}' and Datei eq '${desde_LV_ZDESDE}' and Datef eq '${desde_LV_ZHASTA}'&$format=json`;

            var odTJSONModel = this.getOdataJsonModel( urlParams, oODataJSONModel );
            dTJSON = odTJSONModel.getJSON();
            var TDatos = JSON.parse(dTJSON);

            let Detalles = [  ...TDatos.results[0].Oitms.results ];

            TDatos.results[0].Detalles = {results : [ ...Detalles ] };
            
            delete TDatos.results[0].Citms;
            delete TDatos.results[0].Oitms;

            
            TDatos.results[0].periodo = "Del " + this.formatDateTime( dateRange.getDateValue(), 'dd/MM/YYYY') + " al " + this.formatDateTime(dateRange.getSecondDateValue(), 'dd/MM/YYYY');
            

            var JSONT = $.extend({}, TDatos.results[0]);
            var jsonModelT = new JSONModel();
            jsonModelT.setData(JSONT);
            this.getOwnerComponent().setModel(jsonModelT, "totales");
            
            this.paginate("totales", "/Detalles", 1, 0);
            
        },

         onTableGrouping : function(oEvent) {
              console.log(oEvent.getSource().getSelected());
              if(!oEvent.getSource().getSelected()){
                this.searchData();
              }else{
                this.searchPartidasAbiertas();

              }

          },





        clearFilters :function(){
            //var fechaInicial = new Date();
            //fechaInicial.setDate(1);

            this.getView().byId("dateRange").setValue('');
            
        },
        paginar : function(selectedItem){
                
            let totalRegistros = parseInt( this.getOwnerComponent().getModel('totales').getProperty('/Detalles/results/length'), 10);
            let valorSeleccinado = parseInt( selectedItem.getKey(), 10);
            
            let tablaPrincipal = this.getView().byId("detailsStatementList");
            tablaPrincipal.setVisibleRowCount( totalRegistros < valorSeleccinado ? totalRegistros : valorSeleccinado );
            this.paginateValue(selectedItem, 'totales', '/Detalles');
        },
		buildExportTable: function(){
            var texts = this.getOwnerComponent().getModel("appTxts");
            let Encabezado = this.getOwnerComponent().getModel("totales");
            var columns = [
                {
                    name: texts.getProperty("/state.accountUPC"),
                    template: {
                        content: Encabezado.getProperty("/periodo")
                    }
                },
                {
                    name: texts.getProperty("/state.nameUPC"),
                    template: {
                        content: Encabezado.getProperty("/Name")
                    }
                },
                {
                    name: texts.getProperty("/state.addressUPC"),
                    template: {
                        content: Encabezado.getProperty("/Address")
                    }
                },
                /*{
                    name: texts.getProperty("/state.banknameUPC"),
                    template: {
                        content: Encabezado.getProperty("/Bankl")
                    }
                },*/
                {
                    name: texts.getProperty("/state.banknumberUPC"),
                    template: {
                        content: Encabezado.getProperty("/Bankn")
                    }
                },
                {
                    name: texts.getProperty("/state.invoicedUPC"),
                    template: {
                        content: Encabezado.getProperty("/Totfac")
                    }
                },
                {
                    name: texts.getProperty("/state.totalUPC"),
                    template: {
                        content: Encabezado.getProperty("/Totpag")
                    }
                },
                /*{
                    name: texts.getProperty("/state.amountDiscountUPC"),
                    template: {
                        content: Encabezado.getProperty("/Totdsc")
                    }
                },*/
                {
                    name: texts.getProperty("/state.totalNoteUPC"),
                    template: {
                        content: Encabezado.getProperty("/Totnoc")
                    }
                },
                {
                    name: texts.getProperty("/state.commissionsUPC"),
                    template: {
                        content: Encabezado.getProperty("/Totcm")
                    }
                },
                {
                    name: texts.getProperty("/state.balanceUPC"),
                    template: {
                        content: Encabezado.getProperty("/Totsdo")
                    }
                },
                {
                    name: texts.getProperty("/state.currencyUPC"),
                    template: {
                        content: Encabezado.getProperty("/Banks")
                    }
                },
                {
                    name: texts.getProperty("/state.statusUPC"),
                    template: {
                        content: "{= (${Pendt} === true) ? 'Pendiente' : ( ${Belnr} === ${Augbl} ? 'Pago' : 'Contabilizado'  ) }"
                    }
                },
                {
                    name: texts.getProperty("/state.folioUPC"),
                    template: {
                        content: "{Belnr}"
                    }
                },
                {
                    name: texts.getProperty("/state.referenceUPC"),
                    template: {
                        content: "{Xblnr}"
                    }
                },
                {
                    name: texts.getProperty("/state.typeDocUPC"),
                    template: {
                        content: "{Ltext}"
                    }
                },
                {
                    name: texts.getProperty("/state.dateUPC"),
                    template: {
                        content: "{Budat}"
                    }
                },
                {
                    name: texts.getProperty("/state.amountUPC"),
                    template: {
                        content: "{Wrbtr}"
                    }
                },
                {
                    name: texts.getProperty("/state.conciliationUPC"),
                    template: {
                        content: "{Augbl}"
                    }
                }
            ];

            this.exportxls('totales', '/Detalles/results', columns);
        },
        formatDateTime : (oDateTime, outputFormat, inputFormat) => {

            if( !oDateTime instanceof Date && typeof oDateTime !== 'string' && typeof format !== 'string' ) 
                return false;

            let oFormatOptions = {
                format : outputFormat,
                pattern: outputFormat
            };
            
            let instanceFormatter = sap.ui.core.format.DateFormat.getDateTimeInstance( oFormatOptions );

            if( oDateTime instanceof Date )
                return instanceFormatter.format( oDateTime );

            if( typeof oDateTime == 'string' ){
                let oDate;
                switch (String(inputFormat).toLowerCase()) {
                    case 'yyyymmdd':
                        let aFecha = [];
                        aFecha.push( oDateTime.substring(0,4) );
                        aFecha.push( oDateTime.substring(4,2) );
                        aFecha.push( oDateTime.substring(6,2) );
                        oDate = new Date(aFecha[0], aFecha[1], aFecha[2]);
                        break;
                
                    default:
                        return false;
                        break;
                }

                return instanceFormatter.format( oDate );
            }
            
        }
	});

});