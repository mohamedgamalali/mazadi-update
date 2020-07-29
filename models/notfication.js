const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const notficationSchema = new schema({
    user:{
        type:schema.Types.ObjectId,
        ref:'user'
    },
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
},{timestamps:true});

module.exports = mongoose.model('notfication',notficationSchema);