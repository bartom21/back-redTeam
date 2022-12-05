const express = require('express');
const { db } = require("../firebase");
const admin = require("firebase-admin");
const router = express.Router();
const userController = require('../controllers/user');

async function populateAppointments(appointments){ 
    let users = await userController.getAllUsers();
    let appointmentsOut = []
    for (const appointment of appointments) {
        appointmentsOut.push(populateAppointment(appointment, users))
    }
    return appointmentsOut;
};

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

function populateAppointment(appointment, users){
    let commentsOut = []
    for (const comment of appointment.comments) {
        const authorPopulated = users.find(user => user.uid == comment.author);
        const authorComplete = {
            id: comment.author,
            name: authorPopulated.name,
            role: authorPopulated.customClaims.role
        }
        const newComment = {
            ...comment,
            author: authorComplete
        }
        commentsOut.push(newComment)
    }

    let professionalsOut = []
    for (const professional of appointment.professionals) {
        const professionalPopulated = users.find(user => user.uid == professional && user.customClaims.role == "profesional");
        const professionalComplete = {
            id: professionalPopulated.uid,
            name: professionalPopulated.name
        }
        professionalsOut.push(professionalComplete)
    }

    let patientsOut = []
    for (const patient of appointment.patients) {
        const patientPopulated = users.find(user => user.uid == patient && user.customClaims.role == "paciente");
        const patientComplete = {
            id: patientPopulated.uid,
            name: patientPopulated.name
        }
        patientsOut.push(patientComplete)
    }

    const newAppointment = {
        ...appointment,
        comments: commentsOut,
        professionals: professionalsOut,
        patients: patientsOut
    }
    return newAppointment
}

async function populateAsyncAppointment(appointment){
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
    return newAppointment
}

const queryByRole = async (role, res) => {
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
        const appointmentsOut = await populateAppointments(appointments);
        res.status(201).json({
            appointments: appointmentsOut
        });
    } catch (error) {
      console.error(error);
    }
}


const querySessions = async() => {
    const querySnapshot = await db.collection("sessions").where('deleted','==', false).get();
    const appointments = querySnapshot.docs.map((doc) =>{
    const date = new Date( doc.data().startDate).toLocaleDateString('en-GB').concat(' ', new Date( doc.data().startDate).toLocaleTimeString());
    return {
        id: doc.id,
        isRecurrent: doc.data().rRule ? 'Si' : 'No',
        date: date,
        ...doc.data()
    }});
    const appointmentsOut = await populateAppointments(appointments);
    return appointmentsOut;
}


const queryAllSessions = async (res) => {   
    try {
        const appointmentsOut = await querySessions();
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

exports.querySessions = querySessions;

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

exports.loadUnpaidSessions= async (req, res, next) => {
    try {
        const querySnapshotTherapies = await db.collection("therapies").get();
        const therapies = querySnapshotTherapies.docs.map((doc) =>{
            return {
            id: doc.id,
            ...doc.data()
          }});
          const querySnapshotDiscounts = await db.collection("discounts").get();
          const discounts = querySnapshotDiscounts.docs.map((doc) =>{
              return {
              id: doc.id,
              ...doc.data()
            }});
        const querySnapshot = await db.collection("sessions").where('deleted','==', false).where('state','==','finalized').get();
        const endedAppointments = querySnapshot.docs.map((doc) =>{
            return {
            id: doc.id,
            ...doc.data(),
        }});
        const unpaidAppointments = []
        for (const appointment of endedAppointments) {
            const therapy = therapies.find((item) => item.id === appointment.therapy)
            const duration = Math.abs(new Date(appointment.endDate) - new Date(appointment.startDate)) / 36e5
            if(therapy && therapy.rate && duration > 0){
                for (const patient of appointment.patients) {
                    //console.log(appointment)
                    let discount = discounts.find((item) => item.patient === patient)
                    discount = discount ? discount.rate : 0
                    if(!appointment.invoiced.includes(patient)){
                        const amount = (therapy.rate * duration * ((100- discount)/100)).toFixed(2)
                        const unpaidAppointment = {
                            id: appointment.id+patient,
                            sessionId: appointment.id,
                            title: appointment.title,
                            startDate: appointment.startDate,
                            endDate: appointment.endDate,
                            therapy: therapy.name,
                            patient,
                            amount
                        }
                        unpaidAppointments.push(unpaidAppointment)
                    }
                }
            }
        }
        res.status(201).json({
            appointments: unpaidAppointments
        });
    } catch (error) {
      console.error(error);
    }
}

exports.editSession= async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(req.body)
        let data = req.body.appointment[id];
        if(data.professionals || data.patients){
            const oldSessionRef = db.collection('sessions').doc(id);
            const oldDoc = await oldSessionRef.get();
            const oldAppointment = oldDoc.data()
            let newProfessionals = []
            let newPatients = []
            if(data.professionals){
                const oldProfessionals = oldAppointment.professionals
                const professionals = data.professionals.map((item) => item.id)
                data = {
                    ...data,
                    professionals: professionals
                }
                newProfessionals = professionals.filter(x => !oldProfessionals.includes(x));
            }
            if(data.patients){
                const oldPatients = oldAppointment.patients
                const patients = data.patients.map((item) => item.id)
                data = {
                    ...data,
                    patients: patients
                }
                newPatients = patients.filter(x => !oldPatients.includes(x));
            }
            createSessionNotifications({id:id, professionals: newProfessionals, patients: newPatients}, "asignacion")
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
        let appointment = doc.data()
        appointment = await populateAsyncAppointment(appointment)
        res.status(201).json({
            id: id,
            ...appointment
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
    const date = new Date().toISOString()
    const read = false
    let members = [...data.patients, ...data.professionals, 'Zn0v9k3YsEUfetldWP7iTUiJe582']

    members = members.filter(member => member != trigger)

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

        await db.collection("notifications").add(notification)
    }

}

async function createSessionNotifications(data, option = ""){
    const descriptions = {
        "asignacion": 'Se le ha asignado una nueva sesión: ',
        "recordatorio": 'Recordatorio de sesión: '
    }
    const description = descriptions[option]

    if(description === undefined){
        console.error("Error");
    }

    const appointment = data.id
    const date = new Date().toISOString()
    const read = false
    let members = [...data.patients, ...data.professionals]

    for (const member of members) {
        const target = member
        const notification ={
            description,
            appointment,
            date,
            target,
            read
        }

        await db.collection("notifications").add(notification)
    }

}

exports.createSessionNotifications = createSessionNotifications;


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
                        let appointment = doc2.data()
                        appointment = await populateAsyncAppointment(appointment)
                        res.status(201).json({
                        id: id,
                        ...appointment
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
            const newDoc = await createAppoinment(newAppointment)
            let newCreatedAppointment = {
                id: newDoc.id,
                ...newDoc.data()
            }
            createCommentNotifications({...newCreatedAppointment, comment: comment})
            newCreatedAppointment = await populateAsyncAppointment(newCreatedAppointment)
            const newExDate = req.body.data.appointment.exDate ? req.body.data.appointment.exDate.concat(',',exDate) : exDate
            await db
                    .collection("sessions")
                    .doc(id)
                    .update({exDate: newExDate});
            const updatedDocRef = db
                    .collection("sessions")
                    .doc(id)
            const updatedDoc = await updatedDocRef.get()
            let updatedAppointment = {
                id: updatedDoc.id,
                ...updatedDoc.data()
            }
            updatedAppointment = await populateAsyncAppointment(updatedAppointment)
            res.status(201).json({
                appointments: {
                    updated: updatedAppointment,
                    added: newCreatedAppointment
                }
            })
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
        const notified = false;
        const invoiced = []
        const comments = appointment.comments ? appointment.comments : []
        const state = appointment.state ? appointment.state : 'active'
        const response = await db.collection("sessions").add({
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
            state,
            notified,
            invoiced
        });
        const doc = await response.get()
        return doc
        
}

exports.storeSession = async (req, res, next) => {
   //console.log(req.body)
    const appointment = req.body.appointment; 
    try {
        const doc = await createAppoinment(appointment)
        let newAppointment =  {
            id: doc.id,
            ...doc.data()
        }
        createSessionNotifications(newAppointment, "asignacion")
        newAppointment = await populateAsyncAppointment(newAppointment)
        res.status(201).json({
            appointment: newAppointment
        })
      } catch (error) {
        console.error(error);
      }
}
