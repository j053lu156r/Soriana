sap.ui.define(["demo/controllers/BaseController","sap/ui/core/Fragment","sap/ui/model/json/JSONModel","demo/models/BaseModel"],function(e,t,r){"use strict";var n=new this.ChatBot;return e.extend("demo.controllers.BaseChat",{shutPopOver:function(e){var r=this.getView();if(!this._pChatBot){this._pChatBot=t.load({id:"chatBotFragment",name:"demo.fragments.ChatBotView",controller:this}).then(function(e){r.addDependent(e);return e})}this._pChatBot.then(function(r){r.openBy(e);var n=t.byId("chatBotFragment","chatBotInput");if(n!=null){n.addEventDelegate({onAfterRendering:function(e){}},this)}});var n=this.getOwnerComponent().getModel("cBot");if(n==null){this.initialChatBot()}else{var a=n.getProperty("/ETCBCTRLNAV/results/0/parameter");if(a!=null&&a!=""){var o=JSON.parse(a);this.oRouter=this.getOwnerComponent().getRouter();var i=r.oController.currentRouteName;if(i!=o.target){this.oRouter.navTo(o.target)}}}this.getOwnerComponent().getModel("configSite").setProperty("/hasAutoChat",false)},handleChatbotPress:function(e){var t=e.getSource();this.shutPopOver(t)},initialChatBot:function(){this.getOdataRequest("1","01","M")},getBackChatResponse:function(e,t){var r=parseInt(e);this.getOdataRequest(t,r,"P")},getNextChatResponse:function(e){var t=e.getSource().getBindingContext("cBot").getPath();var r=this.getOwnerComponent().getModel("cBot").getProperty(t);var n=r.level,a=r.option;var o=parseInt(n);o++;this.getOdataRequest(a,o,"M")},getOdataRequest:function(e,a,o){var i=sap.ui.getCore().byId("fieldsBox");if(i!=null){i.destroy()}var l=`/headChatBotSet?$expand=ETCBCTRLNAV&$filter=IIdopcion eq '${e}'`+` and INivel eq '${a}' and ICmd eq '${o}'`;n.getJsonModelAsync(l,function(e,n){var a=e.getProperty("/results/0/ETCBCTRLNAV/results");var o=e.getProperty("/results/0/ENivel");var i=e.getProperty("/results/0/EIdopcion");var l=n.buildChatMessage(a,o,i);var s={ETCBCTRLNAV:{results:[]}};s.ETCBCTRLNAV.results.push(l);n.getOwnerComponent().setModel(new r(s),"cBot");var u=t.byId("chatBotFragment","idTimeline");if(u!=null){u.setVisible(true)}if(l.parameter!=null&&l.parameter!=""){var g=JSON.parse(l.parameter);n.applyResource(g,l.message,n)}},function(e){},this)},btnApply:function(e){var t=this;var r=e.getSource().getBindingContext("viewContext");var n=r.getModel("cBot").getProperty("/ETCBCTRLNAV/results/0");var a=sap.ui.getCore().byId("fieldsBox").getItems();var o=r.getController().currentRouteName;var i=r.getController().getRouter().getTargets().getTarget(o)._oOptions.viewPath;var l=r.getController().getRouter().getTargets().getTarget(o)._oOptions.name;var s=r.getController().getvView(o,i,l);var u=s.getController();if(typeof u.clearFilters==="function"){u.clearFilters()}var g=JSON.parse(n.parameter);if(g.event=="fill"){g.field.forEach(function(e){switch(e.type){case"input":var t=a.find(t=>t.sId==`${e.field}Chat`);var n=t.getValue();if(n!=null&&n!=""){if(o!=g.target){r.getController().getRouter().navTo(g.target)}if(g.idFunction){if(g.idFunction=="0011"){r.getController().changeFieldVlue2("filtroBusqueda","belnr",s)}if(g.idFunction=="0001"){r.getController().changeFieldVlue3("dateOrder","Documento",s)}if(g.idFunction=="0048"){r.getController().changeFieldVlue2("OPFiltrosC","Xblnr",s);r.getController().changeFieldVlue3("dateRange","Documento",s)}if(g.idFunction=="0025"){r.getController().changeFieldVlue3("budat","Documento",s)}}r.getController().changeFieldVlue(e.field,n,s)}break;case"daterange":var t=a.find(t=>t.sId==`${e.field}Chat`);var n=t.getValue();if(n!=null&&n!=""){if(o!=g.target){r.getController().getRouter().navTo(g.target)}if(g.idFunction){if(g.idFunction=="0011"){r.getController().changeFieldVlue2("filtroBusqueda","belnr",s)}if(g.idFunction=="0001"&&e.field!="dateOrder"){r.getController().changeFieldVlue3("dateOrder",n,s)}}r.getController().changeFieldVlue(e.field,n,s)}break}},this);if(typeof u.searchData==="function"){u.searchData()}}},changeFieldVlue:function(e,t,r){var n=r.byId(e);n.setValue(t)},changeFieldVlue2:function(e,t,r){var n=r.byId(e);n.setSelectedKey(t)},changeFieldVlue3:function(e,t,r){var n=r.byId(e);let a=new Date;let o=new Date(2019,1,1);n.setDateValue(o);n.setSecondDateValue(a)},getvView:function(e,t,r){var n=this.oOwnerComponent.getRouter().getViews()._oCache.view;var a=n[`${t}.${r}`]["undefined"];return a},applyResource:function(e,r,n){var a=t.byId("chatBotFragment","idTimeline");switch(e.event){case"navigate":a.setVisible(true);var o=this.getCurrentRouteName();if(o!=e.target){this.getOwnerComponent().getModel("configSite").setProperty("/hasAutoChat",true)}this.getOwnerComponent().getRouter().navTo(e.target);if(e.function!=null&&e.function!=""){setTimeout(function(){var t=n.getRouter().getTargets().getTarget(e.target)._oOptions.viewPath;var r=n.getRouter().getTargets().getTarget(e.target)._oOptions.name;var a=n.getView().getController().getvView(e.target,t,r);var o=a.getController();if(typeof o[e.function]==="function"){o[e.function]()}},1e3)}break;case"fill":var i=t.byId("chatBotFragment","myPopover");var l=new sap.m.VBox({id:"fieldsBox"});l.setVisible(true);l.addItem(new sap.m.Text({text:r}));a.setVisible(false);e.field.forEach(function(e){switch(e.type){case"input":l.addItem(new sap.m.Input({id:`${e.field}Chat`}));break;case"daterange":l.addItem(new sap.m.DateRangeSelection({id:`${e.field}Chat`}));break}},this);var s=new sap.m.Button({press:this.btnApply,text:this.getView().getModel("appTxts").getProperty("/chatbot.search")});s.setBindingContext(this.getView(),"viewContext");l.addItem(s);i.addContent(l);break;default:a.setVisible(true);break}},getCurrentRouteName:function(e=this.getOwnerComponent().getRouter()){const t=e.getHashChanger().getHash();return e.getRouteInfoByHash(t).name},buildChatMessage(e,t,r){var n={message:"",type:"",rOption:r,rLevel:t,options:[],parameter:"",level:""};e.forEach(function(e){switch(e.Ztipo){case"M":n.options.push({name:e.Zname,resource:e.Zrecurso,level:e.Nivel,option:e.Idopcion});break;default:n.message=e.Zname;n.type=e.Ztipo;n.level=e.Nivel;n.parameter=e.Zrecurso;break}});return n},hasOptionVisible:function(e){if(e==undefined||e=="")return true;if(typeof e==="string")e=JSON.parse(e);if(e.hasOwnProperty("idTile"))return this.hasTileVisible(e.idTile);if(e.hasOwnProperty("idFunction"))return this.hasAccess(e.idFunction,false)}})});