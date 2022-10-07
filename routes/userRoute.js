const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const userController = require('../controllers/user');

router.get('/allUsers', isAuth, userController.loadUsers);

router.post('/userRole', isAuth, userController.addRole);

module.exports = router;