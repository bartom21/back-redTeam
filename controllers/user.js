const express = require('express');

const { db } = require("../firebase");
const admin = require("firebase-admin");
const { use } = require('../routes/sessionRoute');

const router = express.Router();

function getUserRowData(user){
    if(user.customClaims && user.customClaims.role === 'profesional'){
        var rowUsers = {
            id: user.uid,
            name: user.name ? user.name : 'Sin asignar',
            email: user.email, 
            isVerified: user.emailVerified ? 'Si' : 'No', 
            role: user.customClaims.role,
            profession: user.profession ? user.profession : 'Sin Asignar'
        };
    }else{
        var rowUsers = {
            id: user.uid,
            name: user.name ? user.name : 'Sin asignar',
            email: user.email, 
            isVerified: user.emailVerified ? 'Si' : 'No', 
            role: user.customClaims ? user.customClaims.role : 'Sin asignar'
        };
    }
    return rowUsers
}

async function getUserProfile(uid){
    console.log(uid)
    let data = null
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) {
        console.log('No such document!');
    } else {
        console.log('Document data:', doc.data());
        data = doc.data()
    }
    return data
}


exports.loadUsers= async (req, res, next) => {

    async function getAllUsers(nextPageToken){

        // List batch of users can be max 1000 at a time.
        var _users_list = [];
        await admin.auth()
            .listUsers(1000, nextPageToken)
            .then(async (listUsersResult) =>    {
    
                for (const userRecord of listUsersResult.users) {
                    const {uid, email, emailVerified, customClaims} = userRecord;
                    const profile = await getUserProfile(uid)
                    if(profile){
                        const name = profile.name
                        profile.profession 
                            ? _users_list.push({uid, name, email, profession: profile.profession  ,emailVerified, customClaims})
                            :  _users_list.push({uid, name, email, emailVerified, customClaims})
                    }else{
                        _users_list.push({uid, email, emailVerified, customClaims})
                    }
                    }
                
                if (listUsersResult.pageToken) {
                    // List next batch of users.
                    const temp_list =  await getAllUsers(listUsersResult.pageToken);
                    if (temp_list.length > 0) { _users_list = _users_list.concat(temp_list); }
                }
    
            })
            .catch((error) => {
                console.log('Error listing users:', error);
                next(error)
            });
    
        return _users_list
    };

    const users = await getAllUsers();
    const usersData =  users.map((user) => getUserRowData(user));;
    res.status(201).json({
        users: usersData
    });

}

exports.loadUsersByRole= async (req, res, next) => {
    const {role} = req.params;
    async function getAllUsers(nextPageToken){

        // List batch of users can be max 1000 at a time.
        var _users_list = [];
        await admin.auth()
            .listUsers(1000, nextPageToken)
            .then(async (listUsersResult) =>    {
                for (const userRecord of listUsersResult.users) {
                    const {uid, customClaims} = userRecord;
                    if(customClaims && customClaims.role==role){
                        const profile = await getUserProfile(uid)
                        if(profile){
                            const name = profile.name
                            _users_list.push({uid, name})
                        }else{
                            _users_list.push({uid})
                        }
                    }
                  }
    
                
                if (listUsersResult.pageToken) {
                    // List next batch of users.
                    const temp_list =  await getAllUsers(listUsersResult.pageToken);
                    if (temp_list.length > 0) { _users_list = _users_list.concat(temp_list); }
                }
    
            })
            .catch((error) => {
                console.log('Error listing users:', error);
                next(error)
            });
    
        return _users_list
    };

    const users = await getAllUsers();
    const usersData =  users.map((user) => ({id: user.uid, name: user.name? user.name : 'Sin asignar'}));
    console.log(users)
    res.status(201).json({
        users: usersData
    });

}

exports.addRole = async (req, res, next) => {
    const {uid} = req.params;
    const {role} = req.body.user;
    console.log('editRole')
    await admin.auth()
        .setCustomUserClaims(uid, { role: role })
        .then(() => {
            admin.auth()
                .getUser(uid)
                    .then((userRecord) => {
                        res.status(201).json({
                            user: getUserRowData(userRecord)
                        });
                     });
        })
        .catch((error) => {
            console.log('Error updating user:', error);
            next(error)
        });
}

exports.createUser = async (req, res, next) => {
    console.log(req.body)
     const {uid, name} = req.body; 
     try {
         await db.collection("users").doc(uid).set({
             name
         });
        const profile = getUserProfile(uid)
        res.status(201).json({
            uid: uid,
           name: profile.name
        });
       } catch (error) {
         console.error(error);
       }
}