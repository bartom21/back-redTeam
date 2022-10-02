const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const sessionController = require('../controllers/session');

router.get('/calendar', sessionController.loadSessions);

router.post('/session', isAuth, sessionController.storeSession);


module.exports = router;