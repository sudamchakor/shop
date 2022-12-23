const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

// const expressHbs = require('express-handlebars');
// const mongoConnect = require("./util/database").mongoConnect;

const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/user');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('63a58436be32fdb6206c03fd').then(user => {
        req.user = user;
        next();
    }).catch(err => {
        console.log(err)
    });
})
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect("mongodb://localhost:27017/shop").then(result => {
    User.findOne().then(user => {
        if (!user) {
            const user = new User({
                name: 'Sudam',
                email: 'chakorsudam@gmail.com',
                cart: {
                    items: []
                }
            });
            user.save();
        }
    });
    app.listen(3000);
}).catch(err => console.log(err));
