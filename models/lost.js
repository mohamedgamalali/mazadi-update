const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const lostSchema = new schema({
    imageUrl:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    user:{
        type:schema.Types.ObjectId,
        ref:'user'
    },
    found:{
        type:Boolean,
        required:true
    }
});

module.exports = mongoose.model('lost',lostSchema);