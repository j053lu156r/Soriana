sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "demo/controllers/BaseController",
    "sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/base/Log"
], function (Controller, BaseController, JSONModel, Device, Log) {
	"use strict";

    
    
	return BaseController.extend("sap.m.sample.SplitApp.C", {

		onInit: function () {
            

            this.getView().addEventDelegate({
                onBeforeShow: function (oEvent) {
                    this.setDaterangeMaxMin();

                    this.Modelo = new DashboardModel();
                
                    this.getData();
                    

                    this.generaTopTen();

                    this.generaGrafica();
                }
            }, this);


        },
        reloadData: function(){
            this.getData();
            this.generaTopTen();
            this.generaGrafica();
        },
        getData: function (oControlEvent){

            if(oControlEvent != null && !oControlEvent.getParameters().selected )
                return false;

            let dateRange = this.getView().byId('dateRange');

            let fechaInicio = this.buildSapDate(dateRange.getDateValue()); 
            let fechaFin = this.buildSapDate(dateRange.getSecondDateValue());

            let expand = [];

            let option = ( oControlEvent != null )? oControlEvent.getSource().getId().split('-').pop() : '1';

            switch (option) {
                case '1':
                case '2':
                case '3':
                    expand.push('ETDBTACNAV','ETPIECHARTNAV','ETTOPNAV','ETHPERNAV');
                    break;
            
                default:
                    break;
            }

            expand = expand.join(',');

            let proveedor = (this.getConfigModel().getProperty("/supplierInputKey") != undefined)? this.getConfigModel().getProperty("/supplierInputKey") : '';

            let url = `HrddashbSet?$expand=${expand}&$filter=IOption eq '${option}' and  ISfalta eq '${fechaInicio}' and  IFfalta eq '${fechaFin}' and ILifnr eq '${proveedor}'&$format=json`;

            this.setDataModel( this.Modelo.getJsonModel( url ).getProperty('/results/0'), option );
        },
        setDataModel: function( Datos, option ){

            let Tipos = [];

            for (let i = 0; i < Datos.ETDBTACNAV.results.length; i++) {
                const element = Datos.ETDBTACNAV.results[i];
                Tipos.push( {posicion:i, descripcion: element.DesAcla });
            }

            Datos.Grupos = Tipos;
            Datos.ValoresActivos = Datos.ETDBTACNAV.results[ 0 ];

            if( this.getOwnerComponent().getModel("Totales") == undefined ) 
                this.getOwnerComponent().setModel(new JSONModel(Datos), "Totales");
            else{
                this.getOwnerComponent().getModel("Totales").setProperty('/ValoresActivos', Datos.ValoresActivos);
                this.getOwnerComponent().getModel("Totales").setProperty('/Grupos', Tipos);
                this.getOwnerComponent().getModel("Totales").setProperty('/ETDBTACNAV', Datos.ETDBTACNAV);
            }


            this.getView().byId('selectAgrupamiento').setSelectedKey('0');
            this.getView().byId('RB1-1').setSelected(true);

        },
        changeDataModel: function( oControlEvent ){
            let posicion = oControlEvent.getParameters().selectedItem.getKey();

            let Model = this.getOwnerComponent().getModel("Totales");

            let ValoresActivos = Model.getProperty('/ETDBTACNAV/results')[ posicion ];

            Model.setProperty('/ValoresActivos', ValoresActivos);
        },
        generaTopTen: function(){
            let dateRange = this.getView().byId('dateRange');

            let fechaInicio = this.buildSapDate(dateRange.getDateValue()); 
            let fechaFin = this.buildSapDate(dateRange.getSecondDateValue());

            let url = `HrddashbSet?$expand=ETDBTACNAV,ETPIECHARTNAV,ETTOPNAV,ETHPERNAV&$filter=IOption eq '5' and  ISfalta eq '${fechaInicio}' and  IFfalta eq '${fechaFin}'&$format=json`;

            let Tipos = [];
            let TiposAclaracionTopTen = [];

            let Datos= this.Modelo.getJsonModel( url ).getProperty('/results/0');
            let x= 0;

            for (let i = 0; i < Datos.ETTOPNAV.results.length; i++) {
                const element = Datos.ETTOPNAV.results[i];
                if( !Tipos.includes(element.DesAcla) ){
                    Tipos.push( element.DesAcla );
                    TiposAclaracionTopTen.push({
                        posicion: x,
                        descripcion:element.DesAcla,
                        Supplier:[ element ]
                    });
                    x++;
                }else{
                    
                    let posicion = Tipos.indexOf( element.DesAcla );
                    if( TiposAclaracionTopTen[posicion].Supplier.length < 10 )   
                        TiposAclaracionTopTen[posicion].Supplier.push( element );
                }
            
            }



            //let TopTen = [];
            
            let TopTen =( Datos.ETTOPNAV.results.length > 0 )? TiposAclaracionTopTen[0].Supplier : [];


            

            //this.Modelo.getJsonModel( url ).setProperty('/Proveedores', TopTen);
            this.getOwnerComponent().getModel('Totales').setProperty('/TopTen', TopTen);
            this.getOwnerComponent().getModel('Totales').setProperty('/Tipos', TiposAclaracionTopTen);
            
        },
        changeTipoTopTen: function(oControlEvent){
            let posicion = oControlEvent.getParameters().selectedItem.getKey();

            if( posicion == '' )
                return;

            let Model = this.getOwnerComponent().getModel("Totales");

            let ValoresActivos = Model.getProperty('/Tipos')[ posicion ];

            let TopTen =( ValoresActivos != null )? ValoresActivos.Supplier : [];

            //let Model = this.getOwnerComponent().getModel("Totales");
            this.getOwnerComponent().getModel('Totales').setProperty('/TopTen', TopTen);
        } ,
        generaGrafica: function(){
            let dateRange = this.getView().byId('dateRange');

            let fechaInicio = this.buildSapDate(dateRange.getDateValue()); 
            let fechaFin = this.buildSapDate(dateRange.getSecondDateValue());

            let proveedor = (this.getConfigModel().getProperty("/supplierInputKey") != undefined)? this.getConfigModel().getProperty("/supplierInputKey") : '';

            let url = `HrddashbSet?$expand=ETDBTACNAV,ETPIECHARTNAV,ETTOPNAV,ETHPERNAV&$filter=IOption eq '4' and  ISfalta eq '${fechaInicio}' and  IFfalta eq '${fechaFin}' and ILifnr eq '${proveedor}'&$format=json`;
            let Datos= this.Modelo.getJsonModel( url ).getProperty('/results/0');

            let PieChart = [];
            let Totales = {
                CantidadRecibidas:0,
                TiempoRecibidas:0,
                ImporteRecibidas:0,
                CantidadCompletadas:0,
                TiempoCompletadas:0,
                ImporteCompletadas:0,
                CantidadPendientes:0,
                TiempoPendientes:0,
                ImportePendientes:0
            };

            for (let i = 0; i < Datos.ETPIECHARTNAV.results.length; i++) {
                const element = Datos.ETPIECHARTNAV.results[i];
                Totales.CantidadRecibidas += parseFloat( element.TotalAc )
                Totales.TiempoRecibidas += parseFloat( element.Antire )
                Totales.ImporteRecibidas += parseFloat( element.ImporRe )
                Totales.CantidadCompletadas += parseFloat( element.TotalComp )
                Totales.TiempoCompletadas += parseFloat( element.AntiComp )
                Totales.ImporteCompletadas += parseFloat( element.ImporComp )
                Totales.CantidadPendientes += parseFloat( element.TotalPend )
                Totales.TiempoPendientes += parseFloat( element.AntiPen )
                Totales.ImportePendientes += parseFloat( element.ImporPend )
                
            }

            for (let x = 0; x < Datos.ETPIECHARTNAV.results.length; x++) {
                const element = Datos.ETPIECHARTNAV.results[x];
                let porcentaje =  (element.TotalAc/Totales.CantidadRecibidas) * 100 ;
                PieChart.push({
                    DesAcla:element.DesAcla,
                    valor: parseFloat(porcentaje.toFixed(2))
                })
            }

            this.getOwnerComponent().getModel('Totales').setProperty('/PieChart', PieChart);
            this.getOwnerComponent().getModel('Totales').setProperty('/Segmentos', PieChart.length);
            this.getOwnerComponent().getModel('Totales').setProperty('/ETPIECHARTNAV', Datos.ETPIECHARTNAV);
            this.getOwnerComponent().getModel('Totales').setProperty('/TotalesChart', Totales);
            
        },
        changePieChart: function(oControlEvent){
            console.log(oControlEvent)
            if( oControlEvent.sId == 'select' && !oControlEvent.getParameters().selected )
                return;

            oControlEvent.getParameters();
            let Datos = this.getOwnerComponent().getModel('Totales').getProperty('/ETPIECHARTNAV/results');
            let Totales = this.getOwnerComponent().getModel('Totales').getProperty('/TotalesChart');
            let PieChart = [];

            

            let indiceRadio = oControlEvent.sId == 'select'? oControlEvent.getSource().getId().split('-').pop() : this.getView().byId('pieChart').getSelectedIndex();
            let opcionSelect = this.getView().byId('selectTipoPieChart').getSelectedKey();
            
            let atributo = '';
            let campoTotales = '';

            switch (parseInt(indiceRadio,10)) {
                case 0:
                    atributo = ( opcionSelect == 'r' )? 'TotalAc' : ( (opcionSelect == 'c')? 'TotalComp' : 'TotalPend' ) ;
                    campoTotales = ( opcionSelect == 'r' )? 'CantidadRecibidas' : ( (opcionSelect == 'c')? 'CantidadCompletadas' : 'CantidadPendientes' ) ;
                    break;
                case 1:
                    atributo = ( opcionSelect == 'r' )? 'Antire' : ( (opcionSelect == 'c')? 'AntiComp' : 'AntiPen' ) ;
                    campoTotales = ( opcionSelect == 'r' )? 'TiempoRecibidas' : ( (opcionSelect == 'c')? 'TiempoCompletadas' : 'TiempoPendientes' ) ;
                    break;
                case 2:
                    atributo = ( opcionSelect == 'r' )? 'ImporRe' : ( (opcionSelect == 'c')? 'ImporComp' : 'ImporPend' ) ;
                    campoTotales = ( opcionSelect == 'r' )? 'ImporteRecibidas' : ( (opcionSelect == 'c')? 'ImporteCompletadas' : 'ImportePendientes' ) ;
                    break;
            
                default:
                    break;
            }

            for (let x = 0; x < Datos.length; x++) {
                const element = Datos[x];
                let porcentaje =  (element[atributo]/Totales[campoTotales]) * 100 ;
                PieChart.push({
                    DesAcla:element.DesAcla,
                    valor: parseFloat(porcentaje.toFixed(2))
                })
            }

            this.getOwnerComponent().getModel('Totales').setProperty('/PieChart', PieChart);
            this.getOwnerComponent().getModel('Totales').setProperty('/Segmentos', PieChart.length);
        },
        setDaterangeMaxMin: function () {
            var datarange = this.getView().byId('dateRange');
            var date = new Date();
            var minDate = new Date();
            minDate.setDate(1);

            datarange.setSecondDateValue(date);
            datarange.setDateValue(minDate);
        },
        exportTopTen: function(){
            var texts = this.getOwnerComponent().getModel("appTxts");

            let tipos = this.getOwnerComponent().getModel('Totales').getProperty('/Tipos');

            let Proveedores = [];

            for (let i = 0; i < tipos.length; i++) {
                const element = tipos[i];
                Proveedores.push( ...element.Supplier );
            }

            //console.log(Proveedores);

            this.getOwnerComponent().getModel('Totales').setProperty('/Proveedores', Proveedores);

            var columns = [
                {
                    name: texts.getProperty("/dashboard.topUPC"),
                    template: {
                        content: "{Ntop}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.supplierUPC"),
                    template: {
                        content: "{Nlifnr}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.supplierNumUPC"),
                    template: {
                        content: "{Lifnr}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.totalCompUPC"),
                    template: {
                        content: "{TotalComp}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.importCompUPC"),
                    template: {
                        content: "{ImporComp}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.tipoUPC"),
                    template: {
                        content: "{DesAcla}"
                    }
                }
            ];

            this.exportxls('Totales', '/Proveedores', columns);
        },
        exportPieChart: function(){
            var texts = this.getOwnerComponent().getModel("appTxts");

            var columns = [
                {
                    name: texts.getProperty("/dashboard.tipoUPC"),
                    template: {
                        content: "{DesAcla}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.totalRecUPC"),
                    template: {
                        content: "{TotalAc}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.antiguedadRecUPC"),
                    template: {
                        content: "{Antire}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.importRecUPC"),
                    template: {
                        content: "{ImporRe}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.totalCompUPC"),
                    template: {
                        content: "{TotalComp}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.antiguedadCompUPC"),
                    template: {
                        content: "{AntiComp}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.importCompUPC"),
                    template: {
                        content: "{ImporComp}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.totalPendUPC"),
                    template: {
                        content: "{TotalPend}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.antiguedadPendUPC"),
                    template: {
                        content: "{AntiPen}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.importPendUPC"),
                    template: {
                        content: "{ImporPend}"
                    }
                }
                
            ];

            this.exportxls('Totales', '/ETPIECHARTNAV/results', columns);
        },
        exportExcel: function(){
            var texts = this.getOwnerComponent().getModel("appTxts");
            
            let indice = this.getView().byId('rbg1').getSelectedIndex();
            let titulo = ( indice === 0  )? texts.getProperty("/dashboard.typesUPC") : ( ( indice === 1 )? texts.getProperty("/dashboard.areaUPC") : texts.getProperty("/dashboard.analystUPC") );

            var columns = [
                {
                    name: titulo,
                    template: {
                        content: "{DesAcla}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.totalRecUPC"),
                    template: {
                        content: "{TotalAc}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.importRecUPC"),
                    template: {
                        content: "{ImporTpagado}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.totalCompUPC"),
                    template: {
                        content: "{TotalComp}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.importCompUPC"),
                    template: {
                        content: "{ImporComp}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.totalPendUPC"),
                    template: {
                        content: "{TotalPend}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.importPendUPC"),
                    template: {
                        content: "{ImporPend}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.7UPC"),
                    template: {
                        content: "{Ant7}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.15UPC"),
                    template: {
                        content: "{Ant15}"
                    }
                },
                {
                    name: texts.getProperty("/dashboard.mayorUPC"),
                    template: {
                        content: "{Antx}"
                    }
                }                
            ];

            this.exportxls('Totales', '/ETDBTACNAV/results', columns);
        }
	});
});