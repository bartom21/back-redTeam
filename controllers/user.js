const express = require('express');

const { db } = require("../firebase");
const admin = require("firebase-admin");
const { use } = require('../routes/sessionRoute');

const router = express.Router();


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
const usersData = users.map((user, index) => ({id: index, email: user.email, isVerified: user.emailVerified.toString(), role: user.customClaims ? user.customClaims.role : 'Sin asignar'}));
console.log(usersData);
res.status(201).json({
    users: usersData
});

}

exports.addRole = async (req, res, next) => {
    const {uid, role} = req.body
    await admin.auth()
    .setCustomUserClaims(uid, { role: role })
    .then(() => {
        res.status(201).json({
            role: role
        });
    })
    .catch((error) => {
        console.log('Error listing users:', error);
        next(error)
    });
}