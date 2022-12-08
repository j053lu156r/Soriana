sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/m/MessageBox","sap/ui/Device","sap/ui/unified/library","sap/ui/unified/DateTypeRange","sap/m/PlanningCalendarView"],function(e,t,n,a,i,s,o){"use strict";var r=i.CalendarIntervalType;var p=i.CalendarDayType;return e.extend("demo.controllers.Quotes.Master",{onInit:function(){var e=new t;e.setData({startDate:new Date(2022,0,8,8,0),people:[{pic:"https://avatars.dicebear.com/api/initials/Anden%201.svg",name:"Anden 1",role:"Primer Anden",freeDays:[5,6],freeHours:[0,1,2,3,4,5,6,17,19,20,21,22,23],appointments:[{start:new Date(2022,0,8,9),end:new Date(2022,0,8,10),title:"Coca-Cola",info:"Dropping Mundet",type:"Type02"}]},{pic:"https://avatars.dicebear.com/api/initials/Anden%202.svg",name:"Anden 2",role:"Segundo Anden",freeDays:[0,6],freeHours:[0,1,2,3,4,5,6,7,18,19,20,21,22,23],appointments:[{start:new Date(2022,0,8,9),end:new Date(2022,0,8,11),title:"Pepsi",info:"Dropping 7up",type:"Type03"}]},{pic:"https://avatars.dicebear.com/api/initials/Anden%203.svg",name:"Anden 3",role:"Tercer Anden",freeDays:[5,6],freeHours:[0,1,2,3,4,5,6,17,19,20,21,22,23],appointments:[{start:new Date(2022,0,8,9),end:new Date(2022,0,8,11),title:"Topo-Chico",info:"Dropping Aguas Minerales",type:"Type03"}]}]});this.getView().setModel(e)},handleAppointmentSelect:function(e){var t=e.getParameter("appointment"),a,i,s;console.log("oAppointment: ",t.mProperties);if(t){a=t.getSelected()?"selected":"deselected";n.show("'"+t.getTitle()+"' "+a+". \n Selected appointments: "+this.byId("PC1").getSelectedAppointments().length)}else{i=e.getParameter("appointments");s=i.length+" Appointments selected";n.show(s)}t.setSelected(false)},handleIntervalSelect:function(e){var t=e.getSource(),n=e.getParameter("startDate"),a=e.getParameter("endDate"),i=e.getParameter("row"),s=this.getView().getModel(),o=s.getData(),r=-1;let p=n.getHours();n.setHours(p);p++;a.setHours(p);let l={start:n,end:a,title:"Appointment "+n,type:"Type09"},d,c;if(i){r=t.indexOfRow(i);o.people[r].appointments.push(l)}else{d=t.getSelectedRows();for(c=0;c<d.length;c++){r=t.indexOfRow(d[c]);o.people[r].appointments.push(l)}}s.setData(o)},handleSelectionFinish:function(e){var t=e.getSource().getSelectedKeys();this.byId("PC1").setBuiltInViews(t)}})});