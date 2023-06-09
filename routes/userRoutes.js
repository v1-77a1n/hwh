const express = require('express');
const controller = require('../controllers/userControllers');
const {isGuest, isLoggedIn} = require('../middlewares/auth');
const {logInLimiter} = require('../middlewares/rateLimiters');
const {validateSignUp, validateLogIn, validateCredentials, validateResult} = require('../middlewares/validator');

const router = express.Router();

//get signup page
router.get('/signup', isGuest, controller.signup);

//create new user
router.post('/signup', isGuest, validateSignUp, validateLogIn, validateResult, controller.newUser);

//get login page
router.get('/login', isGuest, controller.login);

//user logs in
router.post('/login', logInLimiter, isGuest, validateLogIn, validateResult, controller.signin);

//user forgot username
router.get('/forgot_username', isGuest, controller.username);

//user reset username
router.post('/forgot_username', isGuest, validateCredentials, validateResult, controller.usernameReset)

//user forgot password
router.get('/forgot_password', isGuest, controller.password);

//user reset password
router.post('/forgot_password', isGuest, validateCredentials, validateResult, controller.passwordReset);

//get profile
router.get('/profile', isLoggedIn, controller.profile);

//user logout
router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;