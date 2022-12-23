const mongodb = require('mongodb');
const Product = require('../models/product');


exports.getAddProduct = (req, res, next) => {
    res.render('./admin/edit-product', {
        docTitle: "Add Product",
        path: "admin/add-product",
        editing: false,
    });
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(title, price, description, imageUrl);
    product.save().then(result => {
        console.log('Creaated Product', result);
        res.redirect('/');
    }).catch(err => {
        console.log(err);
    })
}

exports.getAdminProducts = (req, res, next) => {
    Product.fetchAll().then(products => {
        res.render('./admin/products-list', {
            prods: products,
            docTitle: 'Admin Products',
            path: 'admin/admin-products'
        });
    })
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
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
            product: product
        });
    }).catch(err => {
        console.log(err);
    })
}

exports.postEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        res.redirect('/');
    }
    const productId = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(title, price, description, imageUrl, productId);
    product.save().then(result => {
        console.log('Updated Product:', productId);
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
    });
}



exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteById(productId).then(() => {
        console.log("Product Deleted")
        res.redirect('/admin/admin-products');
    }).catch(err => console.log(err));
}
