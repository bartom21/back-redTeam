const express = require('express');

const router = express.Router();

const licenceController = require('../controllers/licence');

router.post('/licence', licenceController.storeLicence );
router.put('/updateLicence', licenceController.updateLicence);
router.put('/renewLicence', licenceController.renewLicence);
router.get('/licence', licenceController.loadLicences );
router.get('/populatedLicence', licenceController.loadPopulatedLicences );
router.get('/populatedLicence/:licenceId', licenceController.loadPopulatedLicence );
router.get('/licence/:clientId', licenceController.loadClientLicences );
router.get('/licence/:productId', licenceController.loadProductLicences );
router.get('/licence/:productId/:clientId', licenceController.loadProductClientLicences );
router.get('/licence/:productId/:versionId', licenceController.loadProductVersionLicences );
router.get('/licence/:productId/:versionId/:clientId', licenceController.loadProductVersionClientLicences );


module.exports = router;