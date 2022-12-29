const express = require('express');
const { check, body } = require('express-validator');
const router = express.Router();

const User = require('../models/user');
const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);
router.post(
    '/login',
    check('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail().trim(),
    body('password', 'Enter a valid password.').notEmpty().trim(),
    authController.postLogin
);
router.get('/register', authController.getRegister);
router.post(
    '/register',
    body('fname', 'First name can not be empty.').notEmpty().trim(),
    body('lname', 'Last name can not be empty.').notEmpty().trim(),
    body('password', 'Password should have lenght of 5 characters and cobimnation of numbers and chars').isLength({ min: 5 }).trim(),
    check('email').isEmail().normalizeEmail().trim().withMessage('Enter a valid email address').custom((value, { req }) => {
        return User.findOne({ email: req.body.email }).then(user => {
            if (user) {
                return Promise.reject('Email already in use, please try another.');
            }
        })
    }),
    authController.postRegister
);
router.post('/logout', authController.postLogout);
router.get('/reset', authController.getResetPassword);
router.post('/reset', authController.postResetPassword);
router.get('/new-password/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
