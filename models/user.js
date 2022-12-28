const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,

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
