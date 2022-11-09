const express = require('express');

const { db } = require("../firebase");

const router = express.Router();

const queryByRole = async (role, res) => {
    console.log(role)
    try {
        const querySnapshot = await db.collection("sessions").where('deleted','==', false).where(role+'.id','==', res.locals.user.uid).get();
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

const queryAllSessions = async (res) => {
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

const loadEmptySessions = (res) => {
    try {
        res.status(201).json({
          appointments: []
      });
      } catch (error) {
        console.error(error);
      }
}

const loadSessionsByRole = (user, res) => {
    if(user){
        if(user.customClaims){ 
            if(user.customClaims.role === 'paciente'){ 
                queryByRole('patient', res)
            }else if(user.customClaims.role === 'profesional'){ 
                queryByRole('professional', res)
            }else if(user.customClaims.role === 'admin'){ 
                queryAllSessions(res)
            }else{ 
                loadEmptySessions(res)
            }
        }else{ 
            loadEmptySessions(res)
        }
    }else{ 
        loadEmptySessions(res)
    }
}

exports.deleteSession= async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(id);
        const sessionRef = db.collection('sessions').doc(id);
        await sessionRef.update({deleted: true});  
        loadSessionsByRole(res.locals.user, res)
    } catch (error) {
        console.error(error);
    }
}

exports.editSession= async (req, res, next) => {
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
      res.status(201).json({
        id: id,
        ...doc.data()
    });
    }
    } catch (error) {
        console.error(error);
    }
}

async function createCommentNotifications(data){
    let description = ''
    if(data.comment.action === 'finalizar'){
        description = ' agregó un comentario de finalización en la sesión: '
    }else if(data.comment.action === 'cancelar'){
        description = ' agregó un comentario de cancelación en la sesión: '
    }else {
        description = ' agregó un comentario en la sesión: '
    }
    const trigger = data.comment.author.id
    const appointment = data.id
    const date = data.comment.date
    const read = false
    let members = [data.patient.id, data.professional.id]
    console.log(members)
    members = members.filter(member => member != trigger)
    console.log(members)
    for (const member of members) {
        const target = member
        const notification ={
            description,
            trigger,
            appointment,
            date,
            target,
            read
        }
        console.log(notification)
        await db.collection("notifications").add(notification)
    }

}

exports.addComment= async (req, res, next) => {
    try {
        const { id } = req.params;
        let comment = req.body.comment;
        const sessionRef = db.collection('sessions').doc(id);
        const doc = await sessionRef.get();
        if (!doc.exists) {
            console.log('No such document!');
        } else {
                if(comment.action){
                    if(comment.action === 'finalizar'){
                        await sessionRef.update({state: 'finalized'});
                    }
                    if(comment.action === 'cancelar'){
                        await sessionRef.update({state: 'cancelled'});
                    }
                }else{
                    comment = {...comment, action: 'none'}
                }
                let comments = doc.data().comments;
                comments.push(comment)
                await sessionRef.update({comments: comments});
                const doc2 = await sessionRef.get();
                createCommentNotifications({...doc2.data(), id: id, comment: comment})
                res.status(201).json({
                    id: id,
                    ...doc2.data()
                });
        }
    } catch (error) {
        console.error(error);
    }
}

exports.loadSessions= (req, res, next) => {
    loadSessionsByRole(res.locals.user, res)
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
    const comments = appointment.comments ? appointment.comments : []
    const state = 'active'
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
            comments,
            deleted,
            state
        });
        loadSessionsByRole(res.locals.user, res)
      } catch (error) {
        console.error(error);
      }
}
