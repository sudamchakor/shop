const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/add-product', adminController.getAddProduct);
router.get('/admin-products', adminController.getAdminProducts);

router.post('/add-product', adminController.postAddProduct);

module.exports = router;
