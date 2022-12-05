const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const billingController = require('../controllers/billing');

router.put('/discount/:id', isAuth, billingController.editDiscount);

router.put('/invoice/:id', isAuth, billingController.editInvoice);

router.put('/deleteInvoice/:id', isAuth, billingController.deleteInvoice);

router.get('/invoices', isAuth, billingController.loadInvoices);

router.get('/discounts', isAuth, billingController.loadDiscounts);

router.post('/invoice', isAuth, billingController.storeInvoice);


module.exports = router;