const express = require('express');
const path = require('path');
// const expressHbs = require('express-handlebars');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error')
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');

const app = express();


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1).then(user => {
        req.user = user;
        next();
    }).catch(err => {
        console.log(err)
    });
})
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
sequelize.sync().then(result => {
    return User.findByPk(1)
}).then(user => {
    if (!user) {
        return User.create({ name: 'Sudam Chakor', email: 'chakorsudam@gmail.com' });
    }
    return user;
}).then(result => {
    console.log(result);
    app.listen(3000);
}).catch(err => {
    console.log(err);
});
