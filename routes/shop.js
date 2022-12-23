const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();
router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
router.get('/product/:productId', shopController.getProductsDetials);
router.get('/cart', shopController.getCart);
router.post('/cart', shopController.postCart);
router.post("/cart-delete-item", shopController.postCartDeleteItem);
router.post("/cart-update-qty", shopController.updateCartItemQty);
// router.post('/create-order', shopController.createOrder)
// router.get('/checkout', shopController.getCheckout);
// router.get('/orders', shopController.getOrders);

module.exports = router;
