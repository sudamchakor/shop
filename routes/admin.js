const express = require('express');
const { check, body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/admin-products', isAuth, adminController.getAdminProducts);

router.get('/add-product', isAuth, adminController.getAddProduct);
router.post(
    '/add-product',
    isAuth,
    body('title', 'Title can not be empty.').notEmpty().isLength({ min: 3 }).trim(),
    body('imageUrl', 'Enter a valid image url').notEmpty().trim().isURL({ require_tld: false }),
    body('price', 'Enter a valid Price.').notEmpty().trim().isFloat(),
    body('description', 'Description can not be empty.').notEmpty().trim().isLength({ min: 10 }),
    adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post(
    '/edit-product',
    isAuth,
    body('title', 'Title can not be empty.').notEmpty().isLength({ min: 3 }).trim(),
    body('imageUrl', 'Enter a valid image url').notEmpty().trim().isURL({ require_tld: false }),
    body('price', 'Enter a valid Price.').notEmpty().trim().isFloat(),
    body('description', 'Description can not be empty.').notEmpty().trim().isLength({ min: 10 }),
    adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
