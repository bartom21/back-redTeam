const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const sessionController = require('../controllers/session');

router.put('/deleteSession/:id', isAuth, sessionController.deleteSession);

router.put('/addComment/:id', isAuth, sessionController.addComment);

router.put('/addRComment/:id', isAuth, sessionController.addRComment);

router.put('/session/:id', isAuth, sessionController.editSession);

router.get('/calendar', isAuth, sessionController.loadSessions);

router.post('/session', sessionController.storeSession);



module.exports = router;