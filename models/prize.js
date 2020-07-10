const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const prizeSchema = new schema({
    imageUrl:{
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true
    },
    prizeName:{
        type:String
    },
    price:{
       type:Number,
       required:true 
   }} ,
   {timestamps:true}
);

module.exports = mongoose.model('prize',prizeSchema);