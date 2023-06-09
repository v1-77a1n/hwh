const {validationResult} = require('express-validator');
const {body} = require('express-validator');

exports.validateId = (req, res, next) => {
    let id = req.params.id;
//an objectId is a 24-bit Hex string
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
}

exports.validateSignUp = [body('firstName', 'First name cannot be empty.').notEmpty().trim().escape(), 
body('lastName', 'Last name cannot be empty.').notEmpty().trim().escape(), 
body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(), 
body('password', 'Password must be at least 8 characters and at most 64 characters.').isLength({min: 8, max: 64}),
body('username', 'Username cannot be empty.').notEmpty().trim().escape()];

exports.validateCredentials = [body('email', 'Email cannot be empty').notEmpty().trim().escape().normalizeEmail(),
body('username', 'Username cannot be empty').notEmpty().trim().escape(),
body('password', 'Password must be at least 8 characters and at most 64 characters.').isLength({min: 8, max: 64})];

exports.validateLogIn = [body('username', 'Username cannot be empty').notEmpty().trim().escape(), 
body('password', 'Password must be at least 8 characters and at most 64 characters.').isLength({min: 8, max: 64})];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
};

let today = new Date().toJSON().slice(0, 10);

exports.validateEvent = [body('title', 'Title cannot be empty.').notEmpty().trim().escape(), 
body('details').isLength({min: 10}).trim().escape(),
body('address', 'Cannot be empty').notEmpty().trim().escape(),
body('date').isDate().isAfter(today),
body('start').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
body('end').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).custom((value, { req })=>{
        if(value < req.body.start) {
            throw new Error('Start time greater than end time');
        } 

        return true;
})];