const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const messageSchema = new schema({
    user:{
        type:schema.Types.ObjectId,
        ref:'user'
    },
    message:{
        type:String,
        required:true
    },
    answer:{
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model('supportMessages',messageSchema);