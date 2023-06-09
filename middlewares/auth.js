const Event = require('../models/event');
const {validateId} = require('../middlewares/validator');

//check if user is a guest
exports.isGuest = (req, res, next) => {
    if(!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/user/profile');
    }
};

//check if user is authenticated
exports.isLoggedIn = (req, res, next) => {
    if(req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to log in first');
        return res.redirect('/user/login');
    }
};

//check if user is the host
exports.isHost = (req, res, next) => {
    let id = req.params.id;

    Event.findById(id)
    .then(event=>{
        if(event) {
            if(event.host == req.session.user) {
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        }
    })
    .catch(err=>next(err));
};

//check if user is not host if not host proceed
exports.notHost = (req, res, next) => {
    let id = req.params.id;

    Event.findById(id)
    .then(event=>{
        if(event) {
            if(event.host != req.session.user) {
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        }
    })
    .catch(err=>next(err));
};