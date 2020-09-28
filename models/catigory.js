const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const catigorySchema = new schema({
    imageUrl:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    products:[{
        type:schema.Types.ObjectId,
        ref:'product'
    }],
    form:{
        type:String,
        default:'1',
        enum:['1','2','3']
    },
    hide:{
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model('catigory',catigorySchema);