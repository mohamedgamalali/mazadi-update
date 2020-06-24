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
    products:{
        type:schema.Types.ObjectId,
        ref:'product'
    },
    pillImage:{
        type:String,
        required:true
    },
    pay:{
        type:Boolean,
        default:false
    },view:{
        type:Boolean,
        default:false
    }
},
    {timestamps:true}
);

module.exports = mongoose.model('productPay',paySchime);