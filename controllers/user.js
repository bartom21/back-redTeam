const express = require('express');

const { db } = require("../firebase");
const admin = require("firebase-admin");
const { use } = require('../routes/sessionRoute');

const router = express.Router();

function getUserRowData(user){
    const rowUsers = {
        id: user.uid, 
        email: user.email, 
        isVerified: user.emailVerified ? 'Si' : 'No', 
        role: user.customClaims ? user.customClaims.role : 'Sin asignar'
    };
    return rowUsers
}


exports.loadUsers= async (req, res, next) => {

    async function getAllUsers(nextPageToken){

        // List batch of users can be max 1000 at a time.
        var _users_list = [];
        await admin.auth()
            .listUsers(1000, nextPageToken)
            .then(async (listUsersResult) =>    {
    
                listUsersResult.users.forEach((userRecord) => {
                    const {uid, email, emailVerified, customClaims} = userRecord;
                    _users_list.push({uid, email, emailVerified, customClaims})
                  });
    
                
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
console.log(users);
const usersData =  users.map((user) => getUserRowData(user));;
console.log(usersData);
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