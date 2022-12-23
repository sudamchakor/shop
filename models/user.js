const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
});

userSchema.methods.addToCart = function (product) {
    let cartItems = [{ productId: product._id, quantity: 1 }];
    if (this.cart) {
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString();
        });
        cartItems = [...this.cart.items];
        if (cartProductIndex >= 0) {
            cartItems[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity + 1;
        } else {
            cartItems.push({ productId: product._id, quantity: 1 });
        }
    }
    const updatedCart = { items: cartItems };
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.deleteCartItem = function (productId) {
    const cartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });
    this.cart = cartItems;
    return this.save();
}

userSchema.methods.updateCartQuantity = function (productId, incrQty) {
    let cartItems = [...this.cart.items];
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === productId.toString();
    });

    if (cartProductIndex >= 0) {
        let qty = this.cart.items[cartProductIndex].quantity;
        qty = incrQty === 'true' ? +qty + 1 : +qty - 1;
        cartItems[cartProductIndex].quantity = qty;
        if (qty <= 0) {
            cartItems.splice(cartProductIndex, 1);
        }
    }
    const updatedCart = { items: cartItems };

    this.cart = updatedCart;
    return this.save();
}
userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    this.save();
}
module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require("../util/database").getDb;

// class User {
//     constructor(name, email, cart, id) {
//         this.name = name;
//         this.email = email;
//         this._id = id ? new mongodb.ObjectId(id) : null;
//         this.cart = cart;
//     }

//     save() {
//         const db = getDb();
//         let dbOp;
//         if (this._id) {
//             dbOp = db.collection('users').updateOne({ _id: this._id }, { $set: this });
//         } else {
//             dbOp = db.collection('users').insertOne(this);
//         }
//         return dbOp.then(result => {
//             console.log(result);
//             return result;
//         }).catch(err => {
//             console.log(err);
//         });
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users').findOne({ _id: new mongodb.ObjectId(userId) }).then(user => {
//             return user;
//         }).catch(err => {
//             console.log(err)
//         })
//     }

//     addToCart(product) {
//         const db = getDb();
//         let cartItems = [{ productId: new mongodb.ObjectId(product._id), quantity: 1 }];
//         if (this.cart) {
//             const cartProductIndex = this.cart.items.findIndex(cp => {
//                 return cp.productId.toString() === product._id.toString();
//             });
//             cartItems = [...this.cart.items];
//             if (cartProductIndex >= 0) {
//                 cartItems[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity + 1;
//             } else {
//                 cartItems.push({ productId: new mongodb.ObjectId(product._id), quantity: 1 });
//             }
//         }

//         const updatedCart = { items: cartItems };
//         return db.collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
//     }

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(i => i.productId);
//         return db.collection('products').find({ _id: { $in: productIds } }).toArray().then(products => {
//             return products.map(product => {
//                 return {
//                     ...product,
//                     quantity: this.cart.items.find(i => {
//                         return i.productId.toString() === product._id.toString();
//                     }).quantity
//                 }
//             });
//         });
//     }

//     deleteCartItem(productId) {
//         const cartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString();
//         });
//         const db = getDb();
//         return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: cartItems } } });
//     }

//     updateCartQuantity(productId, incrQty) {
//         const db = getDb();
//         let cartItems = [...this.cart.items];
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === productId.toString();
//         });

//         if (cartProductIndex >= 0) {
//             let qty = this.cart.items[cartProductIndex].quantity;
//             qty = incrQty === 'true' ? +qty + 1 : +qty - 1;
//             cartItems[cartProductIndex].quantity = qty;
//             if (qty <= 0) {
//                 cartItems.splice(cartProductIndex, 1);
//             }
//         }
//         const updatedCart = { items: cartItems };
//         return db.collection('users').updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
//     }

//     addOrder() {
//         const db = getDb();
//         return this.getCart().then(products => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new mongodb.ObjectId(this._id),
//                     name: this.name,
//                     email: this.email
//                 }
//             }
//             return db.collection('orders').insertOne(order)
//         }).then(result => {
//             this.cart = { items: [] };
//             return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: [] } } });
//         }).catch(err => {
//             console.log(err);
//         })
//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({ 'user._id': new mongodb.ObjectId(this._id) }).toArray();
//     }
// }

// module.exports = User;
