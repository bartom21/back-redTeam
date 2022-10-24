const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const userController = require('../controllers/user');

router.get('/allUsers', isAuth, userController.loadUsers);

router.get('/usersByRole/:role', userController.loadUsersByRole);

router.put('/updateProfile/:uid', userController.updateProfile);

router.post('/user', userController.createUser);

router.put('/userRole/:uid', isAuth, userController.addRole);


module.exports = router;