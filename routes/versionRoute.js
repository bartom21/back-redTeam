const express = require('express');

const router = express.Router();

const versionController = require('../controllers/version');

router.post('/version', versionController.storeVersion );
router.put('/updateVersion', versionController.updateVersion);
router.get('/versions/:productId', versionController.loadVersions );
router.get('/version/:versionId', versionController.loadVersion );
router.get('/activeVersions/:productId', versionController.loadActiveVersions );
router.get('/version/:productId/:state', versionController.loadStateVersions );

module.exports = router;