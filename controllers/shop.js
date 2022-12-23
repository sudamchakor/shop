const Product = require('../models/product')
// const cart = require('../models/cart');
// const { where } = require('sequelize');

exports.getProducts = (req, res, next) => {
    Product.fetchAll().then(products => {
        console.log(products);
        res.render('./shop/product-list', {
            prods: products,
            docTitle: 'Shop',
            path: '/products'
        });
    }).catch(err => {
        console.log(err)
    });
}

exports.getIndex = (req, res, next) => {
    Product.fetchAll().then(products => {
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
            path: '/product/' + product._id
        })
    }).catch(err => {
        console.log(err);
    })

}

// exports.getCart = (req, res, next) => {
//     req.user.getCart().then(cart => {
//         return cart.getProducts()
//     }).then(products => {
//         res.render('./shop/cart', {
//             products: products,
//             docTitle: 'Your Cart',
//             path: '/cart'
//         })
//     }).catch(err => console.log(log(err)));
// }

// exports.postCart = (req, res, next) => {
//     const productId = req.body.productId;
//     let fetchedCart;
//     let newQuantity = 1;
//     req.user.getCart().then(cart => {
//         fetchedCart = cart;
//         return cart.getProducts({ where: { id: productId } });
//     }).then(products => {
//         let product;
//         if (products.length > 0) {
//             product = products[0];
//             newQuantity = product.cartItem.quantity;
//         }
//         if (product) {
//             newQuantity++;
//         }
//         return Product.findByPk(productId)
//     }).then(product => {
//         return fetchedCart.addProduct(product, { through: { quantity: newQuantity } })
//     }).then(result => {
//         res.redirect('/cart');
//     }).catch(err => {
//         console.log(err);
//     });
// }

// exports.postCartDeleteItem = (req, res, next) => {
//     const productId = req.body.productId;
//     req.user.getCart().then(cart => {
//         return cart.getProducts({ where: { id: productId } });
//     }).then(products => {
//         const product = products[0];
//         return product.cartItem.destroy();
//     }).then(result => {
//         res.redirect('/cart');
//     }).catch(err => console.log(err));
// }

// exports.updateCartItemQty = (req, res, next) => {
//     const productId = req.body.productId;
//     const incrQty = req.body.incrQty;
//     let newCart = null;
//     let qty = 0;
//     req.user.getCart().then(cart => {
//         newCart = cart;
//         return cart.getProducts({ where: { id: productId } });
//     }).then(products => {
//         if (products.length > 0) {
//             const product = products[0];
//             qty = product.cartItem.quantity;
//             qty = incrQty === 'true' ? 1 + +qty : +qty - 1;
//             if (qty <= 0) {
//                 product.cartItem.destroy().then(result => {
//                     res.redirect('/cart');
//                 });
//             } else {
//                 Product.findByPk(productId).then(product => {
//                     newCart.addProduct(product, { through: { quantity: qty } }).then(result => {
//                         res.redirect('/cart');
//                     });
//                 }).catch(err => {
//                     console.log(err);
//                 });
//             }
//         }
//     });
// }

// exports.createOrder = (req, res, next) => {
//     let fetchCart;
//     req.user.getCart().then(cart => {
//         fetchCart = cart;
//         return cart.getProducts();
//     }).then(products => {
//         return req.user.createOrder().then(order => {
//             return order.addProduct(products.map(product => {
//                 product.orderItem = { quantity: product.cartItem.quantity };
//                 return product;
//             })
//             );
//         }).catch(err => {
//             console.log(err)
//         });
//     }).then(result => {
//         return fetchCart.setProducts(null);
//     }).then(result => {
//         res.redirect('/orders');
//     }).catch(err => {
//         console.log(err)
//     })
// }

// exports.getOrders = (req, res, next) => {
//     req.user.getOrders({ include: ['products'] }).then(orders => {
//         res.render('./shop/orders', {
//             orders: orders,
//             docTitle: 'Your Orders',
//             path: '/orders'
//         });
//     }).catch(err => {
//         console.log(err);
//     });
// }

// exports.getCheckout = (req, res, next) => {
//     Product.fetchAll(products => {
//         res.render('./shop/checkout', {
//             prods: products,
//             docTitle: 'Shop',
//             path: '/checkout'
//         });
//     });
// }
