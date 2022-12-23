const express = require('express');
const path = require('path');
// const expressHbs = require('express-handlebars');
const mongoConnect = require("./util/database").mongoConnect;
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
    User.findById('63a54b1a1d15ee4bd310fd9b').then(user => {
        req.user = new User(user.name, user.email, user.cart, user._id);
        next();
    }).catch(err => {
        console.log(err)
    });
})
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
    app.listen(3000);
});
