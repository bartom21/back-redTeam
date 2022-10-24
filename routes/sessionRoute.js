const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const sessionController = require('../controllers/session');

router.put('/deleteSession/:id', isAuth, sessionController.deleteSession);

router.put('/session/:id', isAuth, sessionController.editSession);

router.get('/calendar2', isAuth, sessionController.loadSessions2);

router.get('/calendar', isAuth, sessionController.loadSessions);

router.post('/session', isAuth, sessionController.storeSession);



module.exports = router;