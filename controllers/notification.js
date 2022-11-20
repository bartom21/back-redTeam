const express = require('express');

const { db } = require("../firebase");

const router = express.Router();

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

