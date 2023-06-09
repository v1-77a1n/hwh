const model = require('../models/user');
const Event = require('../models/event');
const RSVP = require('../models/rsvp');
const bcrypt = require('bcrypt');

//get signup page
exports.signup = (req, res) => {
        res.render('./user/signup');
};

//post signup info
exports.newUser = (req, res, next) => {
    let user = new model(req.body);
    user.save()
    .then(()=>res.redirect('/user/login'))
    .catch(err=>{
        if(err.name === 'ValidationError') {
            req.flash('error', err.message);
            return res.redirect('/user/signup');
        }

        if(err.name === 'MongoError') {
            req.flash('error', 'Email address has been used');
            return res.redirect('/user/signup');
        }

        next(err);
    });
};

//get login page
exports.login = (req, res)=> {
    res.render('./user/login');
};

//process login request
exports.signin = (req, res, next) => {
    //authenticate user's login request
    let username = req.body.username;
    let password = req.body.password;

    //get the user that matches the email
    model.findOne({username: username})
    .then(user=>{
        if(user) {
            //user found in DB
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/user/profile');
                } else {
                    console.log('wrong password');
                    req.flash('error', 'Wrong password');
                    res.redirect('/user/login');
                }
            })
            .catch(err=>next(err));
        } else {
            console.log('wrong username');
            req.flash('error', 'Wrong username');
            res.redirect('/user/login');
        }
    })
    .catch(err=>next(err));
};

//get forgot username page
exports.username = (req, res, next) => {
    res.render('./user/forgotusername');
};

//reset username
exports.usernameReset = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    
    model.findOne({email: email})
    .then((user)=>{
        if(user) {
            //user found in DB
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    model.findOneAndUpdate({email: email}, {username: req.body.username}, {upsert: false})
                    .then(result=>{
                        if(result) {
                            req.flash('success', 'You have successfully updated your username!');
                            return res.redirect('/user/login');
                        } else {
                            console.log('unable to update username');
                            res.flash('error', 'Unable to update username.')
                            return res.redirect('/user/forgot_username');
                        }
                    })
                    .catch(err=>next(err))
                } else {
                    console.log('wrong password');
                    req.flash('error', 'Wrong password');
                    return res.redirect('/user/forgot_username');
                }
            })
            .catch(err=>next(err));
        } else {
            console.log('wrong email address');
            req.flash('error', 'Wrong email address');
            return res.redirect('/user/forgot_username');
        }
    })
    .catch(err=>next(err));
}

//get forgot password page
exports.password = (req, res, next) => {
    res.render('./user/forgotpassword');
};

exports.passwordReset = (req, res, next) => {
    let email = req.body.email;
    let username = req.body.username;

    model.findOne({ email: email, username: username})
    .then((user)=>{
        if(user) {
            let password = req.body.password;
            bcrypt.hash(password, 10)
            .then(hash=>{
                model.findOneAndUpdate({ email: email, username: username}, {password: hash})
                .then(result=>{
                    if(result) {
                        req.flash('success', 'Your password has been successfully updated!');
                        res.redirect('/user/login');
                    } else {
                        console.log('unable to update password');
                        res.flash('error', 'Unable to update password.')
                        res.redirect('/user/forgot_password');
                    }
                })
                .catch(err=>next(err));
            })
            .catch(err=>next(err));
        }
    })
    .catch(err=>next(err));
};

//get profile
exports.profile = (req, res, next)=> {
    let id = req.session.user;
    Promise.all([model.findById(id), Event.find({host: id}), RSVP.find({user: id}).populate('event', 'id title category')])
    .then(result=>{
        const [user, events, rsvp] = result;
        res.render('./user/profile', {user, events, rsvp})
    })
    .catch(err=>next(err));
};

//user logout
exports.logout = (req, res, next) => {
    req.session.destroy(err=> {
        if(err) {
            return next(err);
        } else {
            res.redirect('/');
        }
    });
};