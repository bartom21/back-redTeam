const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const resourceController = require('../controllers/resource');

router.get('/therapies', isAuth, resourceController.loadTherapies);

router.get('/locations', isAuth, resourceController.loadLocations);

router.put('/updateLocationRate/:id', isAuth, resourceController.updateLocation);

router.get('/locationInvoices', isAuth, resourceController.loadLocationInvoices);

router.post('/createLocation', isAuth, resourceController.createLocation);


//router.get('/locationsAvailable', resourceController.loadAvailableLocations);



module.exports = router;