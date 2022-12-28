const Product = require('../models/product');
const Orders = require('../models/order');

exports.getProducts = (req, res, next) => {
    Product.find().then(products => {
        console.log(products);
        res.render('./shop/product-list', {
            prods: products,
            docTitle: 'Shop',
            path: '/products',
        });
    }).catch(err => {
        console.log(err)
    });
}

exports.getIndex = (req, res, next) => {
    Product.find().then(products => {
        console.log(products);
        res.render('./shop/index', {
            prods: products,
            docTitle: 'Shop',
            path: '/'
        });
    }).catch(err => {
        console.log(err)
    });
}

exports.getProductsDetials = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId).then(product => {
        res.render('./shop/product-detials', {
            product: product,
            docTitle: product.title,
            path: '/product/' + product._id,
        })
    }).catch(err => {
        console.log(err);
    })

}

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items;
            res.render('./shop/cart', {
                products: products,
                docTitle: 'Your Cart',
                path: '/cart',
            });
        }).catch(err => {
            console.log(err)
        });
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId).then(product => {
        return req.user.addToCart(product);
    }).then(result => {
        console.log(result);
        res.redirect('/cart');
    }).catch(err => {
        console.log(err);
    });
}

exports.postCartDeleteItem = (req, res, next) => {
    const productId = req.body.productId;
    req.user.deleteCartItem(productId).then(result => {
        res.redirect('/cart');
    }).catch(err => console.log(err));
}

exports.updateCartItemQty = (req, res, next) => {
    const productId = req.body.productId;
    const incrQty = req.body.incrQty;
    req.user.updateCartQuantity(productId, incrQty).then(result => {
        console.log(result);
        res.redirect('/cart');
    }).catch(err => {
        console.log(err);
    });
}

exports.createOrder = (req, res, next) => {
    req.user.populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
            })

            const order = new Orders({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            });
            return order.save();
        }).then(result => {
            return req.user.clearCart();
        }).then(result => {
            res.redirect('/orders');
        }).catch(err => {
            console.log(err)
        });
}

exports.getOrders = (req, res, next) => {
    Orders.find({ 'user.userId': req.user._id }).then(orders => {
        console.log(orders)
        res.render('./shop/orders', {
            orders: orders,
            docTitle: 'Your Orders',
            path: '/orders',
        });
    }).catch(err => {
        console.log(err);
    });
}
