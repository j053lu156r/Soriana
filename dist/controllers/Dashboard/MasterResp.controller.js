sap.ui.define(["sap/ui/core/mvc/Controller","demo/controllers/BaseController","sap/m/MessageBox","sap/ui/model/json/JSONModel","sap/ui/Device","sap/base/Log","sap/ui/export/library","sap/ui/export/Spreadsheet"],function(e,t,a,o,r,l,p,s){"use strict";var n=p.EdmType;var e=t.extend("sap.m.sample.SplitApp.C",{onInit:function(){var e=this;this.getView().addEventDelegate({onBeforeShow:function(e){this.setDaterangeMaxMin();this.Modelo=new DashboardModel;this.getData()}},this)},reloadData:function(){this.getData()},getData:function(e){var t=this;if(e!=null&&!e.getParameters().selected)return false;let a=t.getView().byId("dateRange");let o=t.buildSapDate(a.getDateValue());let r=t.buildSapDate(a.getSecondDateValue());let l=t.getConfigModel().getProperty("/supplierInputKey")!=undefined?t.getConfigModel().getProperty("/supplierInputKey"):"";var p=t.getView().byId("rbg1").getSelectedIndex()+1;p=p.toString();console.log(t.getView().byId("rbg1").getSelectedIndex());console.log(p);console.log(e!=null?e.getSource().getId().split("-").pop():"1");var s=[];switch(p){case"1":case"2":case"3":s.push("ETDBTACNAV","ETPIECHARTNAV","ETTOPNAV","ETHPERNAV");break;default:break}var n=[];n.push(new sap.ui.model.Filter({path:"IOption",operator:sap.ui.model.FilterOperator.EQ,value1:p}));n.push(new sap.ui.model.Filter({path:"ISfalta",operator:sap.ui.model.FilterOperator.EQ,value1:o}));n.push(new sap.ui.model.Filter({path:"IFfalta",operator:sap.ui.model.FilterOperator.EQ,value1:r}));n.push(new sap.ui.model.Filter({path:"ILifnr",operator:sap.ui.model.FilterOperator.EQ,value1:l}));var i="ZOSP_ACDASHBOARD_SRV";var d="HrddashbSet";var g=n;var m="";console.log("1");sap.ui.core.BusyIndicator.show();t._GEToDataV2(i,d,g,s,m).then(function(e){sap.ui.core.BusyIndicator.hide();var a=e.data.results[0];console.log(a);var o=new sap.ui.model.json.JSONModel([]);t.getView().setModel(o,"Totales");var o=new sap.ui.model.json.JSONModel(a);t.getView().setModel(o,"Totales2");t.generaTopTen();var r=[];console.log(a.ETDBTACNAV);for(var l=0;l<a.ETDBTACNAV.results.length;l++){r.push({Posicion:[l],Descripcion:a.ETDBTACNAV.results[l].DesAcla})}var o=new sap.ui.model.json.JSONModel(r);t.getView().setModel(o,"TiposAcl");if(t.getView().byId("selectAgrupamiento").getSelectedKeys()>0){var p=oEvent.getParameter("selectedItems");var s=[{Ant7:0,Ant15:0,Antx:0,ImporComp:0,ImporPend:0,ImporTpagado:0,TotalAc:0,TotalComp:0,TotalPend:0}];for(var l=0;l<p.length;l++){s[0].Ant7=s[0].Ant7+Number(Model.ETDBTACNAV.results[p[l].getKey()].Ant7);s[0].Ant15=s[0].Ant15+Number(Model.ETDBTACNAV.results[p[l].getKey()].Ant15);s[0].Antx=s[0].Antx+Number(Model.ETDBTACNAV.results[p[l].getKey()].Antx);s[0].ImporComp=s[0].ImporComp+Number(Model.ETDBTACNAV.results[p[l].getKey()].ImporComp);s[0].ImporPend=s[0].ImporPend+Number(Model.ETDBTACNAV.results[p[l].getKey()].ImporPend);s[0].ImporTpagado=s[0].ImporTpagado+Number(Model.ETDBTACNAV.results[p[l].getKey()].ImporTpagado);s[0].TotalAc=s[0].TotalAc+Number(Model.ETDBTACNAV.results[p[l].getKey()].TotalAc);s[0].TotalComp=s[0].TotalComp+Number(Model.ETDBTACNAV.results[p[l].getKey()].TotalComp);s[0].TotalPend=s[0].TotalPend+Number(Model.ETDBTACNAV.results[p[l].getKey()].TotalPend)}var o=new sap.ui.model.json.JSONModel(s);t.getView().setModel(o,"General")}else{var n=[];n.push(a.Estotales);var o=new sap.ui.model.json.JSONModel(n);t.getView().setModel(o,"General")}})},changeDataModel:function(e){var t=this;var a=t.getView().getModel("Totales2").getData();if(e.getParameter("selectedItems").length>0){var o=e.getParameter("selectedItems");var r=[{Ant7:0,Ant15:0,Antx:0,ImporComp:0,ImporPend:0,ImporTpagado:0,TotalAc:0,TotalComp:0,TotalPend:0}];for(var l=0;l<o.length;l++){r[0].Ant7=r[0].Ant7+Number(a.ETDBTACNAV.results[o[l].getKey()].Ant7);r[0].Ant15=r[0].Ant15+Number(a.ETDBTACNAV.results[o[l].getKey()].Ant15);r[0].Antx=r[0].Antx+Number(a.ETDBTACNAV.results[o[l].getKey()].Antx);r[0].ImporComp=r[0].ImporComp+Number(a.ETDBTACNAV.results[o[l].getKey()].ImporComp);r[0].ImporPend=r[0].ImporPend+Number(a.ETDBTACNAV.results[o[l].getKey()].ImporPend);r[0].ImporTpagado=r[0].ImporTpagado+Number(a.ETDBTACNAV.results[o[l].getKey()].ImporTpagado);r[0].TotalAc=r[0].TotalAc+Number(a.ETDBTACNAV.results[o[l].getKey()].TotalAc);r[0].TotalComp=r[0].TotalComp+Number(a.ETDBTACNAV.results[o[l].getKey()].TotalComp);r[0].TotalPend=r[0].TotalPend+Number(a.ETDBTACNAV.results[o[l].getKey()].TotalPend)}var p=new sap.ui.model.json.JSONModel(r);t.getView().setModel(p,"General")}else{var s=[];s.push(a.Estotales);var p=new sap.ui.model.json.JSONModel(s);t.getView().setModel(p,"General")}},setDaterangeMaxMin:function(){var e=this;var t=new Date;t=t.getTime()-1e3*60*60*24*90;e.getView().byId("dateRange").setDateValue(new Date(t));e.getView().byId("dateRange").setSecondDateValue(new Date)},generaGrafica:function(){var e=this;let t=this.getView().byId("dateRange");let a=this.buildSapDate(t.getDateValue());let o=this.buildSapDate(t.getSecondDateValue());let r=this.getConfigModel().getProperty("/supplierInputKey")!=undefined?this.getConfigModel().getProperty("/supplierInputKey"):"";var l=[];l.push(new sap.ui.model.Filter({path:"IOption",operator:sap.ui.model.FilterOperator.EQ,value1:"4"}));l.push(new sap.ui.model.Filter({path:"ISfalta",operator:sap.ui.model.FilterOperator.EQ,value1:a}));l.push(new sap.ui.model.Filter({path:"IFfalta",operator:sap.ui.model.FilterOperator.EQ,value1:o}));l.push(new sap.ui.model.Filter({path:"ILifnr",operator:sap.ui.model.FilterOperator.EQ,value1:r}));var p="ZOSP_ACDASHBOARD_SRV";var s="HrddashbSet";var n=["ETDBTACNAV","ETPIECHARTNAV","ETTOPNAV","ETHPERNAV"];var i=l;var d="";sap.ui.core.BusyIndicator.show();e._GEToDataV2(p,s,i,n,d).then(function(t){var a=t.data.results[0];sap.ui.core.BusyIndicator.hide();let o=[];let r={CantidadRecibidas:0,TiempoRecibidas:0,ImporteRecibidas:0,CantidadCompletadas:0,TiempoCompletadas:0,ImporteCompletadas:0,CantidadPendientes:0,TiempoPendientes:0,ImportePendientes:0};for(let e=0;e<a.ETPIECHARTNAV.results.length;e++){const t=a.ETPIECHARTNAV.results[e];r.CantidadRecibidas+=parseFloat(t.TotalAc);r.TiempoRecibidas+=parseFloat(t.Antire);r.ImporteRecibidas+=parseFloat(t.ImporRe);r.CantidadCompletadas+=parseFloat(t.TotalComp);r.TiempoCompletadas+=parseFloat(t.AntiComp);r.ImporteCompletadas+=parseFloat(t.ImporComp);r.CantidadPendientes+=parseFloat(t.TotalPend);r.TiempoPendientes+=parseFloat(t.AntiPen);r.ImportePendientes+=parseFloat(t.ImporPend)}for(let e=0;e<a.ETPIECHARTNAV.results.length;e++){const t=a.ETPIECHARTNAV.results[e];let l=t.TotalAc/r.CantidadRecibidas*100;o.push({DesAcla:t.DesAcla,valor:parseFloat(l.toFixed(2))})}e.getView().getModel("Totales").setProperty("/PieChart",o);e.getView().getModel("Totales").setProperty("/Segmentos",o.length);e.getView().getModel("Totales").setProperty("/ETPIECHARTNAV",a.ETPIECHARTNAV);e.getView().getModel("Totales").setProperty("/TotalesChart",r)})},changePieChart:function(e){var t=this;if(e.sId=="select"&&!e.getParameters().selected)return;e.getParameters();let a=t.getView().getModel("Totales").getProperty("/ETPIECHARTNAV/results");let o=t.getView().getModel("Totales").getProperty("/TotalesChart");let r=[];let l=e.sId=="select"?e.getSource().getId().split("-").pop():t.getView().byId("pieChart").getSelectedIndex();let p=t.getView().byId("selectTipoPieChart").getSelectedKey();let s="";let n="";switch(parseInt(l,10)){case 0:s=p=="r"?"TotalAc":p=="c"?"TotalComp":"TotalPend";n=p=="r"?"CantidadRecibidas":p=="c"?"CantidadCompletadas":"CantidadPendientes";break;case 1:s=p=="r"?"Antire":p=="c"?"AntiComp":"AntiPen";n=p=="r"?"TiempoRecibidas":p=="c"?"TiempoCompletadas":"TiempoPendientes";break;case 2:s=p=="r"?"ImporRe":p=="c"?"ImporComp":"ImporPend";n=p=="r"?"ImporteRecibidas":p=="c"?"ImporteCompletadas":"ImportePendientes";break;default:break}for(let e=0;e<a.length;e++){const t=a[e];let l=t[s]/o[n]*100;r.push({DesAcla:t.DesAcla,valor:parseFloat(l.toFixed(2))})}t.getView().getModel("Totales").setProperty("/PieChart",r);t.getView().getModel("Totales").setProperty("/Segmentos",r.length)},setDaterangeMaxMin:function(){var e=this;var t=new Date;t=t.getTime()-1e3*60*60*24*90;e.getView().byId("dateRange").setDateValue(new Date(t));e.getView().byId("dateRange").setSecondDateValue(new Date)},VisualizadorGraficosP:function(){var e=this;e.getView().byId("graphPie").setVisible(true);e.getView().byId("chartFixFlex").setVisible(false)},VisualizadorGraficosL:function(){var e=this;e.getView().byId("graphPie").setVisible(false);e.getView().byId("chartFixFlex").setVisible(true)},generaTopTen:function(){var e=this;let t=e.getView().byId("dateRange");let a=e.buildSapDate(t.getDateValue());let o=e.buildSapDate(t.getSecondDateValue());var r=[];r.push(new sap.ui.model.Filter({path:"IOption",operator:sap.ui.model.FilterOperator.EQ,value1:"5"}));r.push(new sap.ui.model.Filter({path:"ISfalta",operator:sap.ui.model.FilterOperator.EQ,value1:a}));r.push(new sap.ui.model.Filter({path:"IFfalta",operator:sap.ui.model.FilterOperator.EQ,value1:o}));var l="ZOSP_ACDASHBOARD_SRV";var p="HrddashbSet";var s=["ETDBTACNAV","ETPIECHARTNAV","ETTOPNAV","ETHPERNAV"];var n=r;var i="";sap.ui.core.BusyIndicator.show();e._GEToDataV2(l,p,n,s,i).then(function(t){var a=t.data.results[0];e.generaGrafica();var o=[];var r=[];var l=0;for(var p=0;p<a.ETTOPNAV.results.length;p++){const e=a.ETTOPNAV.results[p];if(!o.includes(e.DesAcla)){o.push(e.DesAcla);r.push({posicion:l,descripcion:e.DesAcla,Supplier:[e]});l++}else{let t=o.indexOf(e.DesAcla);if(r[t].Supplier.length<10)r[t].Supplier.push(e)}}let s=a.ETTOPNAV.results.length>0?r[0].Supplier:[];e.getView().getModel("Totales").setProperty("/TopTen",s);e.getView().getModel("Totales").setProperty("/Tipos",r)})},changeTipoTopTen:function(e){var t=this;let a=e.getParameters().selectedItem.getKey();if(a=="")return;let o=t.getOwnerComponent().getModel("Totales");let r=o.getProperty("/Tipos")[a];let l=r!=null?r.Supplier:[];t.getOwnerComponent().getModel("Totales").setProperty("/TopTen",l)},exportTopTen:function(){var e=this;var t=e.getView().getModel("appTxts");let a=e.getView().getModel("Totales").getProperty("/Tipos");let o=[];for(let e=0;e<a.length;e++){const t=a[e];o.push(...t.Supplier)}e.getView().getModel("Totales").setProperty("/Proveedores",o);var r=[{name:t.getProperty("/dashboard.topUPC"),template:{content:"{Ntop}"}},{name:t.getProperty("/dashboard.supplierUPC"),template:{content:"{Nlifnr}"}},{name:t.getProperty("/dashboard.supplierNumUPC"),template:{content:"{Lifnr}"}},{name:t.getProperty("/dashboard.totalCompUPC"),template:{content:"{TotalComp}"}},{name:t.getProperty("/dashboard.importCompUPC"),template:{content:"{ImporComp}"}},{name:t.getProperty("/dashboard.tipoUPC"),template:{content:"{DesAcla}"}}];e.exportxls("Totales","/Proveedores",r)},exportPieChart:function(){var e=this;var t=e.getView().getModel("appTxts");var a=[{name:t.getProperty("/dashboard.tipoUPC"),template:{content:"{DesAcla}"}},{name:t.getProperty("/dashboard.totalRecUPC"),template:{content:"{TotalAc}"}},{name:t.getProperty("/dashboard.antiguedadRecUPC"),template:{content:"{Antire}"}},{name:t.getProperty("/dashboard.importRecUPC"),template:{content:"{ImporRe}"}},{name:t.getProperty("/dashboard.totalCompUPC"),template:{content:"{TotalComp}"}},{name:t.getProperty("/dashboard.antiguedadCompUPC"),template:{content:"{AntiComp}"}},{name:t.getProperty("/dashboard.importCompUPC"),template:{content:"{ImporComp}"}},{name:t.getProperty("/dashboard.totalPendUPC"),template:{content:"{TotalPend}"}},{name:t.getProperty("/dashboard.antiguedadPendUPC"),template:{content:"{AntiPen}"}},{name:t.getProperty("/dashboard.importPendUPC"),template:{content:"{ImporPend}"}}];e.exportxls("Totales","/ETPIECHARTNAV/results",a)},exportExcel:function(){var e=this;var t=e.getView().getModel("appTxts");let a=this.getView().byId("rbg1").getSelectedIndex();let o=a===0?t.getProperty("/dashboard.typesUPC"):a===1?t.getProperty("/dashboard.areaUPC"):t.getProperty("/dashboard.analystUPC");var r=[{name:o,template:{content:"{DesAcla}"}},{name:t.getProperty("/dashboard.totalRecUPC"),template:{content:"{TotalAc}"}},{name:t.getProperty("/dashboard.importRecUPC"),template:{content:"{ImporTpagado}"}},{name:t.getProperty("/dashboard.totalCompUPC"),template:{content:"{TotalComp}"}},{name:t.getProperty("/dashboard.importCompUPC"),template:{content:"{ImporComp}"}},{name:t.getProperty("/dashboard.totalPendUPC"),template:{content:"{TotalPend}"}},{name:t.getProperty("/dashboard.importPendUPC"),template:{content:"{ImporPend}"}},{name:t.getProperty("/dashboard.7UPC"),template:{content:"{Ant7}"}},{name:t.getProperty("/dashboard.15UPC"),template:{content:"{Ant15}"}},{name:t.getProperty("/dashboard.mayorUPC"),template:{content:"{Antx}"}}];e.exportxls("Totales","/ETDBTACNAV/results",r)},createColumnConfig2:function(){var e=this;var t=e.getView().getModel("General").getData(),a=[];console.log(t);var o=this.getOwnerComponent().getModel("appTxts");a.push({label:o.getProperty("/dashboard.received"),type:n.String,property:"TotalAc"});a.push({label:o.getProperty("/dashboard.reclaimed"),type:n.String,property:"ImporComp"});a.push({label:o.getProperty("/dashboard.completed"),type:n.String,property:"TotalComp"});a.push({label:o.getProperty("/dashboard.paid"),type:n.String,property:"ImporTpagado"});a.push({label:o.getProperty("/dashboard.pendingImp"),type:n.String,property:"ImporPend"});a.push({label:o.getProperty("/dashboard.pending"),type:n.String,property:"TotalPend"});console.log(a);return a},buildExportTablegeneral:function(){var e,t,a,o,r,l=this;if(!l._oTable){l._oTable=this.byId("aclaracionesList")}r=l._oTable;console.log(r);t=r.getBinding().oList;e=l.createColumnConfig2();a={workbook:{columns:e,hierarchyLevel:"Level"},dataSource:t,fileName:"Aclaraciones",worker:false};o=new s(a);o.build().finally(function(){o.destroy()})},createColumnConfig3:function(){var e=this;var t=e.getView().getModel("General").getData(),a=[];console.log(t);var o=this.getOwnerComponent().getModel("appTxts");a.push({label:"Descripción",type:n.String,property:"DesAcla"});a.push({label:"valor",type:n.String,property:"valor"});console.log(a);return a},buildExportpiechart:function(){var e,t,a,o;e=this.createColumnConfig3();t=this.getView().getModel("Totales").getProperty("/PieChart");console.log(t);a={workbook:{columns:e},dataSource:t,fileName:"Notas de Entrada"};o=new s(a);o.build().then(function(){}).finally(o.destroy)}});return e});