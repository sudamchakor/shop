const Product = require('../models/product')
const cart = require('../models/cart')

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('./shop/product-list', {
            prods: products,
            docTitle: 'Shop',
            path: '/products'
        });
    });
}

exports.getProductsDetials = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId, product => {
        res.render('./shop/product-detials', {
            product: product,
            docTitle: product.title,
            path: '/product/' + product.id
        })
    })

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

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId, product => {
        cart.addToCart(productId, +product.price);
    })
    res.redirect('/cart');
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
