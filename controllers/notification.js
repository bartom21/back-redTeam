const express = require('express');
const { db } = require("../firebase");
const router = express.Router();
const sessionController = require('../controllers/session');
const userController = require('../controllers/user');

/*
const cron = require("node-cron");
const nodemailer = require("nodemailer");
app = express();

//check every hour
cron.schedule("0 * * * *", async function () {

    const users = await userController.getAllUsers();
    const appointments = await sessionController.querySessions();
    for (const appointment in appointments){
        if(new Date(appointment.endDate) >= new Date()):
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

    };
});
 

function mailService(user) {
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "<your-email>@gmail.com",
// use generated app password for gmail
      pass: "***********",
    },
  });

  // setting credentials
  let mailDetails = {
    from: "<your-email>@gmail.com",
    to: user,
    subject: "Se a",
    text: "Node.js Cron Job Email Demo Test from Reflectoring Blog",
  };

  // sending email
  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("error occurred", err.message);
    } else {
      console.log("---------------------");
      console.log("email sent successfully");
    }
  });
}
*/




async function populateTrigger(notification){
    let newNotification = notification
    if(notification.trigger){
        const userRef = db.collection('users').doc(notification.trigger);
        const docUser = await userRef.get();
        const triggerComplete = {
            id: notification.trigger,
            name: docUser.data().name
        }
        newNotification = {
            ...notification,
            trigger: triggerComplete
        }
    }
    return newNotification
}

exports.loadNotifications= async (req, res, next) => {
        try {
            const querySnapshot = await db.collection("notifications").where('target','==', res.locals.user.uid).get();
            const notifications = querySnapshot.docs.map( (doc) =>{
                return {
                    id: doc.id,
                    ...doc.data(),                    
            }});
            let notificationsOut = []
            for (const notification of notifications) {
                    const triggerComplete = await populateTrigger(notification)
                    notificationsOut.push(triggerComplete)
            }
            res.status(201).json({
            notifications: notificationsOut
        });
        } catch (error) {
          console.error(error);
        }
}

exports.notificationRead= async (req, res, next) => {
    try {
        const { id } = req.params;
        await db
                .collection("notifications")
                .doc(id)
                .update({read: true});
    const sessionRef = db.collection('notifications').doc(id);
    const doc = await sessionRef.get();
    if (!doc.exists) {
      console.log('No such document!');
    } else {
        const notificationComplete = await populateTrigger({
            id: id,
            ...doc.data()
        })
      res.status(201).json({
        notification: notificationComplete
    });
    }
    } catch (error) {
        console.error(error);
    }
}

