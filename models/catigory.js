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
    }]
});

module.exports = mongoose.model('catigory',catigorySchema);