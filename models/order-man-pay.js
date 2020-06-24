const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const paySchime = new schema({
   user:{
        type:schema.Types.ObjectId,
        ref:'user'
   },
   data:{
        type:schema.Types.ObjectId,
        ref:'user'
    },
    order:{
        type:schema.Types.ObjectId,
        ref:'askForProduct'
    },
    pillImage:{
        type:String,
        required:true
    },
    pay:{
        type:Boolean,
        default:false
    },
    price:{
        type:Number,
        required:true
    },
    view:{
        type:Boolean,
        default:false
    }
},
    {timestamps:true}
);

module.exports = mongoose.model('orderPay',paySchime);