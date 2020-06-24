const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const adminSchema = new schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    bid:{
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model('admin',adminSchema);