const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');


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
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
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
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
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
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
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
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        }
        );
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId).then(product => {
        return req.user.addToCart(product);
    }).then(result => {
        console.log(result);
        res.redirect('/cart');
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);;
    });
}

exports.postCartDeleteItem = (req, res, next) => {
    const productId = req.body.productId;
    req.user.deleteCartItem(productId).then(result => {
        res.redirect('/cart');
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.updateCartItemQty = (req, res, next) => {
    const productId = req.body.productId;
    const incrQty = req.body.incrQty;
    req.user.updateCartQuantity(productId, incrQty).then(result => {
        console.log(result);
        res.redirect('/cart');
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);;
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
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);;
    });
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Orders.findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error('No order found.'));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'));
            }
            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);
            const pdfDoc = new PDFDocument();
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);
            pdfDoc.fontSize(26).text('Invoice', { underline: true });
            pdfDoc.text('===============================================');
            let totalPrice = 0;

            order.products, forEach(prod => {
                totalPrice = totalPrice + +prod.quantity * +prod.product.price;
                pdfDoc.text(`${prod.product.title} - ${prod.quantity} X $${prod.product.price}`)
            });
            pdfDoc.text('===============================================');
            pdfDoc.text(`Total: ${totalPrice}`);
            pdfDoc.text('===============================================');

            pdfDoc.end();
            // fs.readFile(invoicePath, (err, data) => {
            //   if (err) {
            //     return next(err);
            //   }
            //   res.setHeader('Content-Type', 'application/pdf');
            //   res.setHeader(
            //     'Content-Disposition',
            //     'inline; filename="' + invoiceName + '"'
            //   );
            //   res.send(data);
            // });
            // const file = fs.createReadStream(invoicePath);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'inline; filename="' + invoiceName + '"'
            );
            // file.pipe(res);
        })
        .catch(err => next(err));
};
