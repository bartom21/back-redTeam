const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const notificationController = require('../controllers/notification');

router.get('/notifications', isAuth, notificationController.loadNotifications);


router.put('/notification/:id', isAuth, notificationController.notificationRead);


module.exports = router;