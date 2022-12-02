const express = require('express');
const { db } = require("../firebase");
const router = express.Router();
const sessionController = require('../controllers/session');
//const userController = require('../controllers/user');
const rrule = require('rrule')
const cron = require("node-cron");
//const nodemailer = require("nodemailer");

//check every hour

//cron.schedule("*/10 * * * *", async () => {
    //const users = await userController.getAllUsers();
    /*
    const appointments = await sessionController.querySessions();

    const today = new Date();
    const tomorrow =  new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setMinutes(tomorrow.getMinutes() - 15);
    for (const appointment of appointments){
        let eventsInRange = []
        if(appointment.rRule){ //si es recurrente
            let rruleSet = new rrule.RRuleSet()
            rruleSet.rrule(new rrule.rrulestr(appointment.rRule,{dtstart: new Date(appointment.startDate)}))

            // + "\nEXDATE:"+appointment.exDate
            
            if (appointment.exDate){
                rruleSet = rrule.rrulestr((rruleSet.valueOf().join("\n"))+"\nEXDATE:"+appointment.exDate)
            }
            
            // Get all occurrence dates (Date instances):
            
            eventsInRange = rruleSet.between(today, tomorrow)
            if(eventsInRange.length === 0 && appointment.notified){
                await db
                    .collection("sessions")
                    .doc(appointment.id)
                    .update({notified: false});
            }
        }
        if((!appointment.notified)&&((eventsInRange.length > 0)|| ((today < (new Date(appointment.startDate))) && (new Date(appointment.startDate) <= tomorrow)))){
            const professionals = appointment.professionals.map((item) => item.id)
            const patients = appointment.patients.map((item) => item.id)
            await sessionController.createSessionNotifications({...appointment, professionals, patients},"recordatorio");
            await db
                    .collection("sessions")
                    .doc(appointment.id)
                    .update({notified: true});
        }
    };
});
*/
/*
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

