const express = require('express');

const { db } = require("../firebase");
const admin = require("firebase-admin")

const router = express.Router();


exports.loadUsers= async (req, res, next) => {
    /*const listAllUsers = (nextPageToken) => {
        // List batch of users, 1000 at a time.
        console.log("entro");
        var users = [];
        admin.auth()
          .listUsers(2, nextPageToken)
          .then((listUsersResult) => {
            listUsersResult.users.forEach((userRecord) => {
              users.push(userRecord)
            });
            if (listUsersResult.pageToken) {
              // List next batch of users.
              listAllUsers(listUsersResult.pageToken);
            }
            //return users
          })
          .then(()=>{
            console.log(users)
          })
          .catch((error) => {
            console.log('Error listing users:', error);
          });

      };
      // Start listing users from the beginning, 1000 at a time.
    listAllUsers()*/

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
console.log(users)
res.status(201).json({
    users: users
});

}

