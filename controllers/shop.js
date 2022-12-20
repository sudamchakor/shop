const Product = require('../models/product')

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('./shop/product-list', {
            prods: products,
            docTitle: 'Shop',
            path: '/products'
        });
    });
}

exports.getIndex = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('./shop/index', {
            prods: products,
            docTitle: 'Shop',
            path: '/'
        });
    });
}

exports.getCart = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('./shop/cart', {
            prods: products,
            docTitle: 'Your Cart',
            path: '/cart'
        });
    });
}

exports.getCheckout = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('./shop/checkout', {
            prods: products,
            docTitle: 'Shop',
            path: '/checkout'
        });
    });
}

exports.getOrders = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('./shop/orders', {
            prods: products,
            docTitle: 'My Orders',
            path: '/orders'
        });
    });
}
