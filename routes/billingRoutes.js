const express = require('express');

const router = express.Router();

const isAuth = require('../middleware/is-auth');
const billingController = require('../controllers/billing');

router.put('/reward/:id', isAuth, billingController.editReward);

router.put('/invoice/:id', isAuth, billingController.editInvoice);

router.put('/deleteInvoice/:id', isAuth, billingController.deleteInvoice);

router.get('/invoices', isAuth, billingController.loadInvoices);

router.get('/rewards', isAuth, billingController.loadRewards);

router.post('/invoice', isAuth, billingController.storeInvoice);


module.exports = router;