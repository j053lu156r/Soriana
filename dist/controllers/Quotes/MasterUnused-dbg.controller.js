sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox',
    'sap/ui/Device',
    'sap/ui/unified/library',
    'sap/ui/unified/DateTypeRange',
    'sap/m/PlanningCalendarView'
],
    function (Controller, JSONModel, MessageBox, Device, unifiedLibrary, DateTypeRange, PlanningCalendarView) {
        "use strict";

        var CalendarIntervalType = unifiedLibrary.CalendarIntervalType;
        var CalendarDayType = unifiedLibrary.CalendarDayType;

        return Controller.extend("demo.controllers.Quotes.Master", {

            onInit: function () {
                // create model
                var oModel = new JSONModel();
                oModel.setData({
                    startDate: new Date(2022, 0, 8, 8, 0),
                    people: [{
                        pic: "https://avatars.dicebear.com/api/initials/Anden%201.svg",
                        name: "Anden 1",
                        role: "Primer Anden",
                        freeDays: [5, 6],
                        freeHours: [0, 1, 2, 3, 4, 5, 6, 17, 19, 20, 21, 22, 23],
                        appointments: [
                            {
                                start: new Date(2022, 0, 8, 9),
                                end: new Date(2022, 0, 8, 10),
                                title: "Coca-Cola",
                                info: "Dropping Mundet",
                                type: "Type02"
                            },
                        ],
                    },
                    {
                        pic: "https://avatars.dicebear.com/api/initials/Anden%202.svg",
                        name: "Anden 2",
                        role: "Segundo Anden",
                        freeDays: [0, 6],
                        freeHours: [0, 1, 2, 3, 4, 5, 6, 7, 18, 19, 20, 21, 22, 23],
                        appointments: [{
                            start: new Date(2022, 0, 8, 9),
                            end: new Date(2022, 0, 8, 11),
                            title: "Pepsi",
                            info: "Dropping 7up",
                            type: "Type03"
                        },
                        ],
                    },
                    {
                        pic: "https://avatars.dicebear.com/api/initials/Anden%203.svg",
                        name: "Anden 3",
                        role: "Tercer Anden",
                        freeDays: [5, 6],
                        freeHours: [0, 1, 2, 3, 4, 5, 6, 17, 19, 20, 21, 22, 23],
                        appointments: [{
                            start: new Date(2022, 0, 8, 9),
                            end: new Date(2022, 0, 8, 11),
                            title: "Topo-Chico",
                            info: "Dropping Aguas Minerales",
                            type: "Type03"
                        },
                        ],
                    }
                    ]
                });
                this.getView().setModel(oModel);

            },

            handleAppointmentSelect: function (oEvent) {
                var oAppointment = oEvent.getParameter("appointment"),
                    sSelected,
                    aAppointments,
                    sValue;

                console.log("oAppointment: ", oAppointment.mProperties);

                if (oAppointment) {
                    sSelected = oAppointment.getSelected() ? "selected" : "deselected";
                    MessageBox.show("'" + oAppointment.getTitle() + "' " + sSelected + ". \n Selected appointments: " + this.byId("PC1").getSelectedAppointments().length );
                } else {
                    aAppointments = oEvent.getParameter("appointments");
                    sValue = aAppointments.length + " Appointments selected";
                    MessageBox.show(sValue);
                }
                oAppointment.setSelected(false)
            },

            handleIntervalSelect: function (oEvent) {

                var oPC = oEvent.getSource(),
                    oStartDate = oEvent.getParameter("startDate"),
                    oEndDate = oEvent.getParameter("endDate"),
                    oRow = oEvent.getParameter("row"),
                    oModel = this.getView().getModel(),
                    oData = oModel.getData(),
                    iIndex = -1;

                let startHours = oStartDate.getHours();

                oStartDate.setHours(startHours);
                startHours++;
                oEndDate.setHours(startHours);

                let oAppointment = {
                    start: oStartDate,
                    end: oEndDate,
                    title: "Appointment " + oStartDate,
                    type: "Type09"
                },
                    aSelectedRows,
                    i;

                if (oRow) {
                    iIndex = oPC.indexOfRow(oRow);
                    oData.people[iIndex].appointments.push(oAppointment);
                } else {
                    aSelectedRows = oPC.getSelectedRows();
                    for (i = 0; i < aSelectedRows.length; i++) {
                        iIndex = oPC.indexOfRow(aSelectedRows[i]);
                        oData.people[iIndex].appointments.push(oAppointment);
                    }
                }

                oModel.setData(oData);
            },

            handleSelectionFinish: function (oEvent) {
                var aSelectedKeys = oEvent.getSource().getSelectedKeys();
                this.byId("PC1").setBuiltInViews(aSelectedKeys);
            },

        });

    });
