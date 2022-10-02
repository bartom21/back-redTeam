const express = require('express');

const { db } = require("../firebase");

const router = express.Router();

exports.loadSessions= async (req, res, next) => {
        try {
          const querySnapshot = await db.collection("contacts").get();
          const contacts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          res.status(201).json({
            clients: contacts
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
        res.status(200);
      } catch (error) {
        console.error(error);
      }
}
  