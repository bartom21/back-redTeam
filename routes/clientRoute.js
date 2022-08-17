const express = require('express');

const router = express.Router();

const clientController = require('../controllers/client');

router.get('/client', clientController.loadClients);


module.exports = router;