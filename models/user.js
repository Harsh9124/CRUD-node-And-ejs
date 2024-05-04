const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/CRUD');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
    img: Buffer
});


module.exports  = mongoose.model('user', userSchema);


