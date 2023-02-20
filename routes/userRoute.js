const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const userController = require('../controllers/user');

router.get('/allUsers', isAuth, userController.loadUsers);

router.get('/usersByRole/:role', isAuth, userController.loadUsersByRole);

router.put('/updateProfile/:uid', isAuth, userController.updateProfile);

router.post('/user', isAuth, userController.createUser);

router.put('/userRole/:uid', isAuth, userController.addRole);


module.exports = router;