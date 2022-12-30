const Product = require('../models/product');
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file');

const ITEMS_PER_PAGE = 2;

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
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const errors = { hasErrors: false };
    console.log(image);
    validationResult(req).array().map(err => {
        errors.hasErrors = true;
        errors[err.param] = err.msg;
    });
    if (!image) {
        errors.hasErrors = true;
        errors['image'] = 'Attached file is not image.';
    }
    if (errors.hasErrors) {
        return res.status(422).render('./admin/edit-product', {
            docTitle: "Add Product",
            path: "admin/add-product",
            editing: false,
            inputErrors: errors,
            product: {
                title: title,
                imageUrl: '',
                price: price,
                description: description,
            }
        });
    }
    const imageUrl = image.path;
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });
    product.save().then(result => {
        console.log('Created Product', result);
        res.redirect('/admin/admin-products');
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getAdminProducts = (req, res, next) => {
    const page = req.query.page || 1;
    let totalItems = 0;
    Product.find({ userId: req.user._id }).countDocuments().then(numProducts => {
        totalItems = numProducts;
        return Product.find({ userId: req.user._id }).skip((+page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
    }).then(products => {
        res.render('./admin/products-list', {
            prods: products,
            docTitle: 'Admin Products',
            path: 'admin/admin-products',
            totalProducts: totalItems,
            currentPage: +page,
            hasNextPage: ITEMS_PER_PAGE * +page < totalItems,
            hasPreviousPage: +page > 1,
            nextPage: +page + 1,
            previousPage: +page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const errors = { hasErrors: false };
    validationResult(req).array().map(err => {
        errors.hasErrors = true;
        errors[err.param] = err.msg;
    });

    if (errors.hasErrors) {
        return res.status(422).render('./admin/edit-product', {
            docTitle: "Edit Product",
            path: `admin/edit-product/${productId}`,
            editing: false,
            inputErrors: errors,
            product: {
                title: title,
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
        if (image) {
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        product.price = price;
        product.description = description;
        return product.save().then(result => {
            console.log('Updated Product:', productId);
            res.redirect('/admin/admin-products');
        });

    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.deleteProduct = (req, res, next) => {
    const productId = req.params.productId;
    console.log(req.user._id);
    Product.findById(productId).then(product => {
        if (!product) {
            return next(new Error('Product not found'));
        }
        try {
            fileHelper.deleteFile(product.imageUrl);
        } catch (err) {
            console.log(err);
        }
        return Product.deleteOne({ _id: productId, userId: req.user._id });
    }).then(() => {
        console.log("Product Deleted with Id:", productId)
        res.status(200).json({ message: 'Success' })
    }).catch(err => {
        res.status(500).json({ message: 'Deleting product failed.' })
    });
}
