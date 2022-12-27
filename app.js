const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

// const expressHbs = require('express-handlebars');
// const mongoConnect = require("./util/database").mongoConnect;

const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

const MONGODB_URI = "mongodb://localhost:27017/shop";
const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'session'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }))

app.use((req, res, next) => {
    console.log(req.session.user)
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id).then(user => {
        req.user = user;
        next();
    }).catch(err => {
        console.log(err)
    });
});
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect(MONGODB_URI).then(result => {
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
