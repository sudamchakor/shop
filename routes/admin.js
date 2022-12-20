const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/admin-products', adminController.getAdminProducts);

router.get('/add-product', adminController.getAddProduct);
router.post('/add-product', adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);
router.post('/edit-product', adminController.postEditProduct);

module.exports = router;
