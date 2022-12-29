const Product = require('../models/product');
const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
    res.render('./admin/edit-product', {
        docTitle: "Add Product",
        path: "admin/add-product",
        editing: false,
        inputErrors: {},
        product: {
            title: '',
            imageUrl: '',
            price: '',
            description: '',
        }
    });
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const errors = { hasErrors: false };
    console.log(validationResult(req).array())
    validationResult(req).array().map(err => {
        errors.hasErrors = true;
        errors[err.param] = err.msg;
    })
    if (errors.hasErrors) {
        return res.status(422).render('./admin/edit-product', {
            docTitle: "Add Product",
            path: "admin/add-product",
            editing: false,
            inputErrors: errors,
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description,
            }
        });
    }
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });
    product.save().then(result => {
        console.log('Creaated Product', result);
        res.redirect('/admin/admin-products');
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode(500);
        return next(error);
    });
}

exports.getAdminProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        .then(products => {
            res.render('./admin/products-list', {
                prods: products,
                docTitle: 'Admin Products',
                path: 'admin/admin-products',
            });
        })
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode || editMode !== 'true') {
        res.redirect('/');
    }

    const productId = req.params.productId;
    Product.findById(productId).then(product => {
        if (!product) {
            res.redirect('/');
        }
        res.render('./admin/edit-product', {
            docTitle: "Edit Product",
            path: "admin/edit-product",
            editing: editMode,
            product: product,
            inputErrors: {},
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode(500);
        return next(error);
    })
}

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const errors = { hasErrors: false };
    validationResult(req).array().map(err => {
        errors.hasErrors = true;
        errors[err.param] = err.msg;
    })
    if (errors.hasErrors) {
        return res.status(422).render('./admin/edit-product', {
            docTitle: "Edit Product",
            path: `admin/edit-product/${productId}`,
            editing: false,
            inputErrors: errors,
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description,
            }
        });
    }
    Product.findById(productId).then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = title;
        product.imageUrl = imageUrl;
        product.price = price;
        product.description = description;
        return product.save().then(result => {
            console.log('Updated Product:', productId);
            res.redirect('/admin/admin-products');
        });

    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode(500);
        return next(error);
    });
}

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteOne({ _id: productId, userId: req.user._id }).then(() => {
        console.log("Product Deleted")
        res.redirect('/admin/admin-products');
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode(500);
        return next(error);
    });
}
