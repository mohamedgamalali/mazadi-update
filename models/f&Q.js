const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const FaQSchema = new schema({
    ask:{
        type:String,
        required:true
    },
    answer:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('F&Q',FaQSchema);