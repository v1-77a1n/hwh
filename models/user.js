const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    firstName: {type: String, required: [true, 'cannot be empty']},
    lastName: {type: String, required: [true, 'cannot be empty']},
    username: {type: String, required: [true, 'cannot be empty'], unique: true},
    email: {type: String, required: [true, 'cannot be empty'], unique: true},
    password: {type: String, required: [true, 'cannot be empty']}
});

userSchema.pre('save', function(next) {
    let user = this;
    if(!user.isModified('password')) {
        return next();
    } else {
        bcrypt.hash(user.password, 10)
        .then(hash=>{
            user.password = hash;
            next();
        })
        .catch(err=>next(err));
    }
});

//implement a method to compare the login password and the stored hash in DB
userSchema.methods.comparePassword = function(loginPassword) {
    let user = this;
    return bcrypt.compare(loginPassword, user.password);
};

module.exports = mongoose.model('User', userSchema);