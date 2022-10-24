const express = require('express');

const { db } = require("../firebase");

const router = express.Router();

exports.deleteSession= async (req, res, next) => {
    console.log("deleteSession");
    console.log(req.body)
    try {
        const { id } = req.params;
        console.log(id);
        const sessionRef = db.collection('sessions').doc(id);
        await sessionRef.update({deleted: true});  
        const querySnapshot = await db.collection("sessions").where('deleted','==', false).get();
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

exports.loadSessions2= async (req, res, next) => {
    if(res.locals.user){
        if(res.locals.user.customClaims){ 
            if(res.locals.user.customClaims.role === 'paciente'){ 
                console.log( res.locals.user.uid)
                try {
                    const querySnapshot = await db.collection("sessions").where('deleted','==', false).where('patient.id','==', res.locals.user.uid).get();
                    const appointments = querySnapshot.docs.map((doc) =>{
                    const date = new Date( doc.data().startDate).toLocaleDateString('en-GB').concat(' ', new Date( doc.data().startDate).toLocaleTimeString());
                    return {
                    id: doc.id,
                    isRecurrent: doc.data().rRule ? 'Si' : 'No',
                    date: date,
                    ...doc.data()
                  }});
                  res.status(201).json({
                    appointments: appointments
                });
                } catch (error) {
                  console.error(error);
                }
            }
        }
    }
    console.log(res.locals.user.customClaims.role)
    res.status(200)
}

exports.loadSessions= async (req, res, next) => {
        try {
            const querySnapshot = await db.collection("sessions").where('deleted','==', false).get();
            const appointments = querySnapshot.docs.map((doc) =>{
            const date = new Date( doc.data().startDate).toLocaleDateString('en-GB').concat(' ', new Date( doc.data().startDate).toLocaleTimeString());
            return {
            id: doc.id,
            isRecurrent: doc.data().rRule ? 'Si' : 'No',
            date: date,
            ...doc.data()
          }});
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
    const location = appointment.location;
    const rRule = appointment.rRule ? appointment.rRule : null;
    const deleted = false;
    try {
        await db.collection("sessions").add({
            title,
            startDate,
            endDate,
            allDay,
            patient,
            professional,
            therapy,
            location,
            rRule,
            deleted
        });
        const querySnapshot = await db.collection("sessions").where('deleted','==', false).get();
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
