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
    },
    startAt:{
        type:Number,
        default:0
    },
    endAt:{
        type:Number,
        default:0
    }
});

module.exports = mongoose.model('admin',adminSchema);