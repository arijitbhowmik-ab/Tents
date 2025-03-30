const mongoose = require('mongoose');
const Schema = mongoose.Schema

const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
})

userSchema.plugin(passportLocalMongoose);   //This plugin automatically add Hashing, saltimg, password and username

module.exports = mongoose.model('User', userSchema);