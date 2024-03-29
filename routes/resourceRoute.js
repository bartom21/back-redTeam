const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const resourceController = require('../controllers/resource');

router.get('/therapies', resourceController.loadTherapies);

router.get('/locations', resourceController.loadLocations);



module.exports = router;