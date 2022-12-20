const Product = require('../models/product')
const cart = require('../models/cart')

exports.getProducts = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('./shop/product-list', {
            prods: products,
            docTitle: 'Shop',
            path: '/products'
        });
    }).catch(err => {
        console.log(err)
    });
}

exports.getProductsDetials = (req, res, next) => {
    const productId = req.params.productId;
    Product.findAll({ where: { id: productId } }).then(products => {
        res.render('./shop/product-detials', {
            product: products[0],
            docTitle: products[0].title,
            path: '/product/' + products[0].id
        })
    }).catch(err => {
        console.log(err);
    })

}

exports.getIndex = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('./shop/index', {
            prods: products,
            docTitle: 'Shop',
            path: '/'
        });
    }).catch(err => {
        console.log(err)
    });
}

exports.getCart = (req, res, next) => {
    req.user.getCart().then(cart => {
        return cart.getProducts()
    }).then(products => {
        console.log(products);
        res.render('./shop/cart', {
            products: products,
            docTitle: 'Your Cart',
            path: '/cart'
        })
    }).catch(err => console.log(log(err)));
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart().then(cart => {
        fetchedCart = cart;
        return cart.getProducts({ where: { id: productId } });
    }).then(products => {
        let product;
        if (products.length > 0) {
            product = products[0];
            newQuantity = product.cartItem.quantity;
        }
        if (product) {
            newQuantity++;
        }
        return Product.findByPk(productId)
    }).then(product => {
        return fetchedCart.addProduct(product, { through: { quantity: newQuantity } })
    }).then(result => {
        res.redirect('/cart');
    }).catch(err => {
        console.log(err);
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

// exports.getCart = (req, res, next) => {
//     cart.getCart(cart => {
//         Product.fetchAll(products => {
//             const cartProducts = []
//             for (product of products) {
//                 const cartProd = cart.products.find(prod => prod.id == product.id)
//                 if (cartProd) {
//                     cartProducts.push({ productData: product, qty: cartProd.qty });
//                 }
//             }
//             res.render('shop/cart', {
//                 path: '/cart',
//                 docTitle: "Cart",
//                 products: cartProducts
//             })
//         })
//     })
// }

exports.postCartDeleteItem = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId, product => {
        cart.deleteProduct(productId, product.price);
        res.redirect('/cart');
    })
}
