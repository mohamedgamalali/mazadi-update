const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const userSchema = new schema({
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    verification:{
        type:Boolean,
        default:false
    },
    FCMJwt:[{
        type:String
    }],
    pids:[{ 
        product:{
            type:schema.Types.ObjectId,
            ref:'product'
        }      
    }],
    postedProducts:[{
        type:schema.Types.ObjectId,
        ref:'product'
    }],
    fevProducts:[{
        type:schema.Types.ObjectId,
        ref:'product'
    }],
    fevAskProduct:[{
        type:schema.Types.ObjectId,
        ref:'askForProduct'
    }],
    notfications:[{
        data:{
            id:String,
            key:String,
            data:String
        },
        notification:{
            title:String,
            body:String
        },
        date:{
            type:String,
            required:true
        }
    }],
    forgetPasswordCode:String,
    codeExpireDate:Date
});

module.exports = mongoose.model('user',userSchema);