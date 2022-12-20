const express = require('express');
const path = require('path');
// const expressHbs = require('express-handlebars');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error')
const sequelize = require('./util/database');

const app = express();

// app.engine('hbs', expressHbs({
//     layoutsDir: 'views/layouts',
//     defualtLayout: 'main-layout',
//     extName: 'hbs'
// }));
// app.set('view engine', 'hbs');
// app.set('view engine', 'pug');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

sequelize.sync().then(result => {
    console.log(result);
    app.listen(3000);
}).catch(err => {
    console.log(err);
});
