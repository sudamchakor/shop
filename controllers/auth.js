const User = require('../models/user');


exports.getLogin = (req, res, next) => {
    console.log(req.session.isLoggedIn)
    res.render('./auth/login', {
        docTitle: 'login',
        path: '/login',
        isAuthenticated: false
    });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findById('63a58436be32fdb6206c03fd')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(err => {
                console.log(err);
                res.redirect('/');
            });
        })
        .catch(err => console.log(err));
}

exports.getRegister = (req, res, next) => {
    res.render('./auth/register', {
        docTitle: 'Registration',
        path: '/register'
    });
}

exports.postRegister = (req, res, next) => {
    const fname = req.body.fname;
    const lname = req.body.lname;
    const email = req.body.email;
    const password = req.body.password;
    console.log(fname, lname, email, password);
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
}
