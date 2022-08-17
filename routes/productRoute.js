const express = require('express');

const router = express.Router();

const productController = require('../controllers/product');

router.post('/product', productController.storeProduct );
router.put('/updateProduct', productController.updateProduct );
router.get('/product', productController.loadProducts );
router.get('/product/:productId', productController.loadProduct );

module.exports = router;