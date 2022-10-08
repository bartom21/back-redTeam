const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const userController = require('../controllers/user');

router.get('/allUsers', isAuth, userController.loadUsers);

router.put('/userRole/:uid', isAuth, userController.addRole);

module.exports = router;