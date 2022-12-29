const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransporter = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator');


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
        errorMessage: {},
        oldInputs: { email: '', password: '' }
    });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = { hasErrors: false };
    validationResult(req).array().map(err => {
        errors.hasErrors = true;
        errors[err.param] = err.msg;
    })
    if (errors.hasErrors) {
        return res.status(422).render(
            './auth/login', {
            docTitle: 'login',
            path: '/login',
            isAuthenticated: false,
            errorMessage: errors,
            oldInputs: { email: email, password: password }
        }
        )
    }
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(422).render(
                    './auth/login', {
                    docTitle: 'login',
                    path: '/login',
                    isAuthenticated: false,
                    errorMessage: { email: 'Invalid email address.' },
                    oldInputs: { email: email, password: password }
                }
                );
            }
            return bcrypt.compare(password, user.password).then(doMatch => {
                if (!doMatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err => {
                        return res.status(422).render(
                            './auth/login', {
                            docTitle: 'login',
                            path: '/login',
                            isAuthenticated: false,
                            errorMessage: { password: 'Invalid password.' },
                            oldInputs: { email: email, password: password }
                        });
                    });
                } else {
                    res.redirect('/');
                }
            }).catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getRegister = (req, res, next) => {
    res.render('./auth/register', {
        docTitle: 'Registration',
        path: '/register',
        isAuthenticated: false,
        errorMessage: {},
        oldInputs: {
            fname: '',
            lname: '',
            email: '',
            password: '',
        }
    });
}

exports.postRegister = (req, res, next) => {
    const fname = req.body.fname;
    const lname = req.body.lname;
    const email = req.body.email;
    const password = req.body.password;
    const errors = { hasErrors: false };
    validationResult(req).array().map(err => {
        errors.hasErrors = true;
        errors[err.param] = err.msg;
    })
    if (errors.hasErrors) {
        return res.status(422).render(
            './auth/register', {
            docTitle: 'Registration',
            path: '/register',
            isAuthenticated: false,
            errorMessage: errors,
            oldInputs: {
                fname: req.body.fname,
                lname: req.body.lname,
                email: req.body.email,
                password: req.body.password,
            }
        }
        )
    }
    bcrypt.hash(password, 12).then(hashPassword => {
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
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
}


exports.getResetPassword = (req, res, next) => {
    let message = req.flash('error');
    message = message.length > 0 ? message[0] : null;
    res.render('./auth/reset', {
        docTitle: 'Reset Password',
        path: '/reset',
        isAuthenticated: false,
        errorMessage: message
    });
}

exports.postResetPassword = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            res.redirect('/reset')
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email }).then(user => {
            if (!user) {
                req.flash('error', 'No acount found with that email');
                return res.redirect("/reset");
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 36000;
            return user.save();

        }).then(result => {
            res.redirect(`/new-password/${token}`);
            console.log(`http://localhost:3000/new-password/${token}`);
            return transporter.sendMail({
                to: req.body.email,
                from: "shop@nodejs.com",
                subject: "Password reset",
                html: `<p>You requested the passwword reset</p>
                        <p>Click this <a href='http:localhost:3000/new-password/${token}'>link</a> to set new password</p>
                        <p>This token will expire in one hour<\p>`
            });
        }).catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    });
}

exports.getNewPassword = (req, res, next) => {
    let message = req.flash('error');
    message = message.length > 0 ? message[0] : null;
    const token = req.params.token;

    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then(user => {
        if (user) {
            return res.render('./auth/new-password', {
                docTitle: 'Reset Password',
                path: '/new-password',
                isAuthenticated: false,
                userId: user._id.toString(),
                errorMessage: message,
                passwordToken: token
            });
        } else {
            return res.redirect('/reset')
        }
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.postNewPassword = (req, res, next) => {
    const userId = req.body.userId;
    const password = req.body.password;
    const passwordToken = req.body.passwordToken;

    User.findOne({ _id: userId, token: passwordToken, resetTokenExpiration: { $gt: Date.now() } }).then(user => {
        return bcrypt.hash(password, 12).then(hashPassword => {
            user.token = null;
            user.resetTokenExpiration = null;
            user.password = hashPassword;
            return user.save();
        }).then(result => {
            console.log(result)
            res.redirect('/login');
        });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}
