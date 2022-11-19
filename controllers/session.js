const express = require('express');

const { db } = require("../firebase");
const admin = require("firebase-admin");
const router = express.Router();


async function populateAuthor(comment){
    const userRef = db.collection('users').doc(comment.author);
    const docUser = await userRef.get();
    const userRecord = await admin.auth().getUser(comment.author)
    const authorComplete = {
        id: comment.author,
        name: docUser.data().name,
        role: userRecord.customClaims.role
    }
    const newComment = {
        ...comment,
        author: authorComplete
    }
    return newComment
}

async function populateProfile(id){
    const userRef = db.collection('users').doc(id);
    const docUser = await userRef.get();
    const profileComplete = {
        id: id,
        name: docUser.data().name
    }
    return profileComplete
}

const queryByRole = async (role, res) => {
    console.log(role)
    try {
        const querySnapshot = await db.collection("sessions").where('deleted','==', false).where(role+'s', 'array-contains',res.locals.user.uid).get();
        const appointments = querySnapshot.docs.map((doc) =>{
            const date = new Date( doc.data().startDate).toLocaleDateString('en-GB').concat(' ', new Date( doc.data().startDate).toLocaleTimeString());
            return {
            id: doc.id,
            isRecurrent: doc.data().rRule ? 'Si' : 'No',
            date: date,
            ...doc.data(),
        }});
        let appointmentsOut = []
        for (const appointment of appointments) {
            let commentsOut = []
            for (const comment of appointment.comments) {
                const authorComplete = await populateAuthor(comment)
                commentsOut.push(authorComplete)
            }
              let professionalsOut = []
              for (const professional of appointment.professionals) {
                  const professionalComplete = await populateProfile(professional)
                  professionalsOut.push(professionalComplete)
              }
              let patientsOut = []
              for (const patient of appointment.patients) {
                  const patientComplete = await populateProfile(patient)
                  patientsOut.push(patientComplete)
              }
              const newAppointment = {
                ...appointment,
                comments: commentsOut,
                professionals: professionalsOut,
                patients: patientsOut
            }
            appointmentsOut.push(newAppointment)
        }
        res.status(201).json({
            appointments: appointmentsOut
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
      let appointmentsOut = []
      for (const appointment of appointments) {
          let commentsOut = []
          for (const comment of appointment.comments) {
              const authorComplete = await populateAuthor(comment)
              commentsOut.push(authorComplete)
          }
            let professionalsOut = []
            for (const professional of appointment.professionals) {
                const professionalComplete = await populateProfile(professional)
                professionalsOut.push(professionalComplete)
            }
            let patientsOut = []
            for (const patient of appointment.patients) {
                const patientComplete = await populateProfile(patient)
                patientsOut.push(patientComplete)
            }
            const newAppointment = {
              ...appointment,
              comments: commentsOut,
              professionals: professionalsOut,
              patients: patientsOut
          }
          appointmentsOut.push(newAppointment)
      }
      res.status(201).json({
          appointments: appointmentsOut
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
        console.log(req.body)
        let data = req.body.appointment[id];
        if(data.professionals){
            const professionals = data.professionals.map((item) => item.id)
            data = {
                ...data,
                professionals: professionals
            }
        }
        if(data.patients){
            const patients = data.patients.map((item) => item.id)
            data = {
                ...data,
                patients: patients
            }
        }
        await db
                .collection("sessions")
                .doc(id)
                .update(data);
    const sessionRef = db.collection('sessions').doc(id);
    const doc = await sessionRef.get();
    if (!doc.exists) {
      console.log('No such document!');
    } else {
        const appointment = doc.data()
        let commentsOut = []
          for (const comment of appointment.comments) {
              const authorComplete = await populateAuthor(comment)
              commentsOut.push(authorComplete)
          }
            let professionalsOut = []
            for (const professional of appointment.professionals) {
                const professionalComplete = await populateProfile(professional)
                professionalsOut.push(professionalComplete)
            }
            let patientsOut = []
            for (const patient of appointment.patients) {
                const patientComplete = await populateProfile(patient)
                patientsOut.push(patientComplete)
            }
            const newAppointment = {
                ...appointment,
                comments: commentsOut,
                professionals: professionalsOut,
                patients: patientsOut
            }
      res.status(201).json({
        id: id,
        ...newAppointment
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
    const trigger = data.comment.author
    const appointment = data.id
    const date = data.comment.date
    const read = false
    let members = [...data.patients, ...data.professionals, 'Zn0v9k3YsEUfetldWP7iTUiJe582']
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
        let comment = req.body.data.comment;
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
                if (!doc2.exists) {
                    console.log('No such document!');
                  } else {
                      const appointment = doc2.data()
                      let commentsOut = []
                        for (const comment of appointment.comments) {
                            const authorComplete = await populateAuthor(comment)
                            commentsOut.push(authorComplete)
                        }
                          let professionalsOut = []
                          for (const professional of appointment.professionals) {
                              const professionalComplete = await populateProfile(professional)
                              professionalsOut.push(professionalComplete)
                          }
                          let patientsOut = []
                          for (const patient of appointment.patients) {
                              const patientComplete = await populateProfile(patient)
                              patientsOut.push(patientComplete)
                          }
                          const newAppointment = {
                              ...appointment,
                              comments: commentsOut,
                              professionals: professionalsOut,
                              patients: patientsOut
                          }
                    res.status(201).json({
                      id: id,
                      ...newAppointment
                  });}
        }
    } catch (error) {
        console.error(error);
    }
}


exports.addRComment= async (req, res, next) => {
    try {
        const { id } = req.params;
        let comment = req.body.data.comment;
        let exDate = req.body.data.exDate;
            let newAppointment = {...req.body.data.appointment, rRule: null}
            delete newAppointment.id
            if(comment.action){
                if(comment.action === 'finalizar'){
                    newAppointment = {...newAppointment, state: 'finalized'};
                }
                if(comment.action === 'cancelar'){
                    newAppointment = {...newAppointment, state: 'cancelled'};
                }
            }else{
                comment = {...comment, action: 'none'}
            }
            newAppointment = {...newAppointment, comments: [comment]};
            await createAppoinment(newAppointment)
            const newExDate = req.body.data.appointment.exDate ? req.body.data.appointment.exDate.concat(',',exDate) : exDate
            await db
                .collection("sessions")
                .doc(id)
                .update({exDate: newExDate});
            loadSessionsByRole(res.locals.user, res)
    } catch (error) {
        console.error(error);
    }
}

exports.loadSessions= (req, res, next) => {
    loadSessionsByRole(res.locals.user, res)
}

async function createAppoinment(appointment){
        const title = appointment.title;
        const startDate = appointment.startDate;
        const endDate = appointment.endDate;
        const allDay = appointment.allDay;
        const patients = appointment.patients.map((item) => item.id)
        const professionals = appointment.professionals.map((item) => item.id)
        const therapy = appointment.therapy;
        const location = appointment.location;
        const rRule = appointment.rRule ? appointment.rRule : null;
        const deleted = false;
        const comments = appointment.comments ? appointment.comments : []
        const state = appointment.state ? appointment.state : 'active'
        await db.collection("sessions").add({
            title,
            startDate,
            endDate,
            allDay,
            patients,
            professionals,
            therapy,
            location,
            rRule,
            comments,
            deleted,
            state
        });
}

exports.storeSession = async (req, res, next) => {
   //console.log(req.body)
    const appointment = req.body.appointment; 
    try {
        await createAppoinment(appointment)
        loadSessionsByRole(res.locals.user, res)
      } catch (error) {
        console.error(error);
      }
}
