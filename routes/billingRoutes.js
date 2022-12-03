const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const billingController = require('../controllers/billing');

router.get('/invoices', isAuth, billingController.loadInvoices);

router.post('/invoice', isAuth, billingController.storeInvoice);


module.exports = router;