const express = require('express');
const { db } = require("../firebase");
const router = express.Router();


const loadInvoices = async (req, res, next) => {
    try {
        const querySnapshot = await db.collection("invoices").where('deleted','==', false).get();
        const invoices = querySnapshot.docs.map((doc) =>{
            const invoice = doc.data()
            const amount = invoice.sessions.map(item => parseFloat(item.amount)).reduce((prev, next) => prev + next).toFixed(2)
            return {
            id: doc.id,
            ...invoice,
            amount
        }});
      res.status(201).json({
        invoices: invoices
    });
    } catch (error) {
      console.error(error);
    }
  }

exports.loadInvoices = loadInvoices;

exports.storeInvoice= async (req, res, next) => {
    try {
        if(req.body.invoice){
            const invoice = req.body.invoice;
            const creationDate = invoice.date;
            const sessions = invoice.sessions;
            const patient = invoice.patient;
            const paid = false;
            const deleted = false
            const response = await db.collection("invoices").add({
                creationDate,
                sessions,
                patient,
                paid,
                deleted
            });
            const doc = await response.get()
            const oldInvoice = doc.data()
            const amount = oldInvoice.sessions.map(item => parseFloat(item.amount)).reduce((prev, next) => prev + next).toFixed(2)
            let newInvoice =  {
                id: doc.id,
                ...oldInvoice,
                amount
            }
            for(const appointment of newInvoice.sessions){
                const oldSessionRef = db.collection('sessions').doc(appointment.sessionId);
                const oldDoc = await oldSessionRef.get();
                const oldAppointment = oldDoc.data()
                const invoiced = oldAppointment.invoiced
                if(!invoiced.includes(newInvoice.patient)){
                    invoiced.push(newInvoice.patient)
                    await db
                        .collection("sessions")
                        .doc(appointment.sessionId)
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

exports.editInvoice= async (req, res, next) => {
    try {
        if(req.params.id && req.body.data.invoice && req.body.data.oldInvoice ){
            const invoice = req.body.data.invoice
            const oldInvoice = req.body.data.oldInvoice 
            let newInvoice = {
                ...invoice,
                creationDate: oldInvoice.date
            }
            await db
                .collection("invoices")
                .doc(req.params.id)
                .update(newInvoice);
            const removedSessions = oldInvoice.sessions.filter(x => !invoice.sessions.includes(x));
            for(const appointment of removedSessions){
                const oldSessionRef = db.collection('sessions').doc(appointment.sessionId);
                const oldDoc = await oldSessionRef.get();
                const oldAppointment = oldDoc.data()
                let invoiced = oldAppointment.invoiced
                if(invoiced.includes(oldInvoice.patientObj.id)){
                    invoiced = invoiced.filter((x) => x !== oldInvoice.patientObj.id)
                    console.log()
                    await db
                        .collection("sessions")
                        .doc(appointment.sessionId)
                        .update({invoiced: invoiced});
                }
            }
            for(const appointment of invoice.sessions){
                const oldSessionRef = db.collection('sessions').doc(appointment.sessionId);
                const oldDoc = await oldSessionRef.get();
                const oldAppointment = oldDoc.data()
                const invoiced = oldAppointment.invoiced
                if(!invoiced.includes(invoice.patient)){
                    invoiced.push(invoice.patient)
                    await db
                        .collection("sessions")
                        .doc(appointment.sessionId)
                        .update({invoiced: invoiced});
                }
            }
            const amount = invoice.sessions.map(item => parseFloat(item.amount)).reduce((prev, next) => prev + next).toFixed(2)
            res.status(201).json({
                ...newInvoice,
                amount,
                id: req.params.id
            })
        }
    } catch (error) {
        console.error(error);
    }
    
}

exports.deleteInvoice= async (req, res, next) => {
    try {
        if(req.params.id){
            await db
                .collection("invoices")
                .doc(req.params.id)
                .update({deleted: true});
            const invoiceRef = db.collection('invoices').doc(req.params.id);
            const invoiceDoc = await invoiceRef.get();
            const invoice = invoiceDoc.data()
            for(const appointment of invoice.sessions){
                const oldSessionRef = db.collection('sessions').doc(appointment.sessionId);
                const oldDoc = await oldSessionRef.get();
                const oldAppointment = oldDoc.data()
                let invoiced = oldAppointment.invoiced
                if(invoiced.includes(invoice.patient)){
                    invoiced = invoiced.filter((x) => x !== invoice.patient)
                    console.log()
                    await db
                        .collection("sessions")
                        .doc(appointment.sessionId)
                        .update({invoiced: invoiced});
                }
            }
            loadInvoices(req, res, next)
        }
    } catch (error) {
        console.error(error);
    }
    
}

exports.editDiscount= async (req, res, next) => {
    try {
        if(req.params.id){
            const querySnapshot = await db.collection("discounts").where('professional','==',req.params.id ).get();
            const discounts = querySnapshot.docs.map((doc) =>{
                return {
                    id: doc.id,
                    ...doc.data(),
            }});
            if(discounts.length > 0){
                await db
                    .collection("discounts")
                    .doc(discounts[0].id)
                    .update({rate: req.body.discount});
                const updatedDiscount =  {
                    professional: req.params.id,
                    rate: req.body.discount
                }
                res.status(201).json({
                    discount: updatedDiscount
                });
            }else{
                const response = await db.collection("discounts").add({
                    professional: req.params.id,
                    rate: req.body.discount
                });
                const doc = await response.get()
                const newDiscount =  {
                    ...doc.data()
                }
                res.status(201).json({
                    discount: newDiscount
                });
            }
            
        }
    } catch (error) {
        console.error(error);
    }
    
}

exports.loadDiscounts= async (req, res, next) => {
    try {
        const querySnapshot = await db.collection("discounts").get();
        const discounts = querySnapshot.docs.map((doc) =>{
        return {
        id: doc.id,
        ...doc.data()
      }});
      res.status(201).json({
        discounts: discounts
    });
    } catch (error) {
      console.error(error);
    }
}