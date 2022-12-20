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
    req.user.createProduct({
        title: title,
        price: price,
        imageUrl: imageUrl,
        description: description,
        userId: req.user.id
    }).then(result => {
        console.log('Creaated Product');
        res.redirect('/');
    }).catch(err => {
        console.log(err);
    })
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        res.redirect('/');
    }

    const productId = req.params.productId;
    req.user.getProducts({ where: { id: productId } }).then(products => {
        if (!products) {
            res.redirect('/');
        }
        res.render('./admin/edit-product', {
            docTitle: "Edit Product",
            path: "admin/edit-product",
            editing: editMode,
            product: products[0]
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
    Product.findByPk(productId).then(product => {
        product.title = title;
        product.imageUrl = imageUrl;
        product.price = price;
        product.description = description;
        return product.save();
    }).then(result => {
        console.log('UpdatedProduct');
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
    })
}

exports.getAdminProducts = (req, res, next) => {
    req.user.getProducts().then(products => {
        res.render('./admin/products-list', {
            prods: products,
            docTitle: 'Admin Products',
            path: 'admin/admin-products'
        });
    }).catch(err => {
        console.log(err)
    });

}

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findByPk(productId).then(product => product.destroy()).then(resut => {
        console.log("Product Deleted")
        res.redirect('/admin/admin-products');
    }).catch(err => console.log(err));
}
