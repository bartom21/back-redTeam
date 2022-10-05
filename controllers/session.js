const express = require('express');

const { db } = require("../firebase");

const router = express.Router();

exports.editSession= async (req, res, next) => {
    console.log("editSession");
    console.log(req.body)
    try {
        const { id } = req.params;
        const data = req.body.appointment[id];
        await db
                .collection("sessions")
                .doc(id)
                .update(data);
    /*const updated = await db
                        .collection("sessions")
                        .doc(id)
                        .get().docs[0].data();*/
    const sessionRef = db.collection('sessions').doc(id);
    const doc = await sessionRef.get();
    if (!doc.exists) {
      console.log('No such document!');
    } else {
      console.log('Document data:', doc.data());
      res.status(201).json({
        id: id,
        ...doc.data()
    });
    }
    } catch (error) {
        console.error(error);
    }
}

exports.loadSessions= async (req, res, next) => {
        try {
          const querySnapshot = await db.collection("sessions").get();
          const appointments = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          res.status(201).json({
            appointments: appointments
        });
        } catch (error) {
          console.error(error);
        }
}

exports.storeSession = async (req, res, next) => {
   //console.log(req.body)
    const appointment = req.body.appointment; 
    const title = appointment.title;
    const startDate = appointment.startDate;
    const endDate = appointment.endDate;
    const allDay = appointment.allDay;
    const patient = appointment.patient;
    const professional = appointment.professional;
    const therapy = appointment.therapy;
    const rRule = appointment.rRule ? appointment.rRule : null;
    try {
        await db.collection("sessions").add({
            title,
            startDate,
            endDate,
            allDay,
            patient,
            professional,
            therapy,
            rRule
        });
        const querySnapshot = await db.collection("sessions").get();
        const appointments = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.status(201).json({
            appointments: appointments
        });
      } catch (error) {
        console.error(error);
      }
}
