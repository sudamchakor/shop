const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransporter = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransporter({
    auth: {
        api_key: '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'
    }
}));
exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    message = message.length > 0 ? message[0] : null;
    res.render('./auth/login', {
        docTitle: 'login',
        path: '/login',
        isAuthenticated: false,
        errorMessage: message
    });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password.');
                return res.redirect('/login');
            }
            return bcrypt.compare(password, user.password).then(doMatch => {
                console.log(doMatch)
                if (doMatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err => {
                        console.log(err);
                        res.redirect('/');
                    });
                }
                res.redirect('/login');
            }).catch(err => {
                console.log(err);
                res.redirect('/login');
            });
        })
        .catch(err => console.log(err));
}

exports.getRegister = (req, res, next) => {
    let message = req.flash('error');
    message = message.length > 0 ? message[0] : null;
    res.render('./auth/register', {
        docTitle: 'Registration',
        path: '/register',
        isAuthenticated: false,
        errorMessage: message
    });
}

exports.postRegister = (req, res, next) => {
    const fname = req.body.fname;
    const lname = req.body.lname;
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email }).then(result => {
        if (result) {
            req.flash('error', 'Email already in use, please try another.');
            return res.redirect('/register');
        }
        return bcrypt.hash(password, 12).then(hashPassword => {
            const user = new User({ fname: fname, lname: lname, email: email, password: hashPassword });
            return user.save();
        }).then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: "shop@nodejs.com",
                subject: "Successfully sign up",
                html: "<h1>You have successfully sign up</h1>"
            });
        });
    }).catch(err => {
        console.log(err);
    });
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
}
