const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const AdsSchema = new schema({
    imageUrl:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        required:true
    },
    phone:{
        type:String
    },
   type:{
       type:String,
       required:true 
   }} ,
   {timestamps:true}
);

module.exports = mongoose.model('Ads',AdsSchema);