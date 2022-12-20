const fs = require('fs');
const path = require('path');

const cart = require('./cart');

const p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json');

const getProductsFromFile = (cb) => {
    fs.readFile(p, (error, fileContent) => {
        if (error) {
            return cb([]);
        }
        return cb(JSON.parse(fileContent));
    });
}

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            if (this.id) {
                const exisitngProductIndex = products.findIndex(prod => prod.id == this.id)
                const updatedProducts = [...products];
                updatedProducts[exisitngProductIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                    console.log("Error Writing file", err);
                });
            } else {
                this.id = Date.now();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), err => {
                    console.log("Error Writing file", err);
                });
            }
        });
    }

    static fetchAll(cb) {
        getProductsFromFile(cb);
    }

    static findById(productId, cb) {
        getProductsFromFile(products => {
            const product = products.find(p => p.id == productId)
            cb(product);
        });
    }

    static deleteById(prodId) {
        getProductsFromFile(products => {
            const product = products.find(prod => prod.id == prodId);
            const updatedProducts = products.filter(p => p.id != prodId);
            fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                if (!err) {
                    cart.deleteProduct(prodId, product.price);
                }
            });
        });
    }
}
