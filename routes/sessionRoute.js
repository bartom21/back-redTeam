const express = require('express');

const router = express.Router();

const sessionController = require('../controllers/session');

router.get('/session', sessionController.loadSessions);

router.post('/session', sessionController.storeSession);


module.exports = router;