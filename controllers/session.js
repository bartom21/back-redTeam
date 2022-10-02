const express = require('express');

const { db } = require("../firebase");

const router = express.Router();

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
    console.log(req.body)
    const appointment = req.body.appointment; 
    const title = appointment.title;
    const startDate = appointment.startDate;
    const endDate = appointment.endDate;
    const allDay = appointment.allDay;
    try {
        await db.collection("sessions").add({
            title,
            startDate,
            endDate,
            allDay
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
  