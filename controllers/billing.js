const express = require('express');
const { db } = require("../firebase");
const router = express.Router();


exports.loadInvoices= async (req, res, next) => {
    try {
        const querySnapshot = await db.collection("invoices").get();
        const invoices = querySnapshot.docs.map((doc) =>{
        return {
        id: doc.id,
        ...doc.data()
      }});
      res.status(201).json({
        invoices: invoices
    });
    } catch (error) {
      console.error(error);
    }
  }

exports.storeInvoice= async (req, res, next) => {
    try {
        if(req.body.invoice){
            const invoice = req.body.invoice;
            const creationDate = invoice.date;
            const sessions = invoice.sessions;
            const patient = invoice.patient;
            const paid = false;
            const response = await db.collection("invoices").add({
                creationDate,
                sessions,
                patient,
                paid
            });
            const doc = await response.get()
            let newInvoice =  {
                id: doc.id,
                ...doc.data()
            }
            for(const appointment of newInvoice.sessions){
                const oldSessionRef = db.collection('sessions').doc(appointment.id);
                const oldDoc = await oldSessionRef.get();
                const oldAppointment = oldDoc.data()
                const invoiced = oldAppointment.invoiced
                if(!invoiced.includes(newInvoice.patient)){
                    invoiced.push(newInvoice.patient)
                    await db
                        .collection("sessions")
                        .doc(appointment.id)
                        .update({invoiced: invoiced});
                }
            }
            res.status(201).json({
                invoice: newInvoice
            })
        }
    } catch (error) {
        console.error(error);
    }
    
}