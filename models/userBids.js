const mongoose = require('mongoose');

const schema = mongoose.Schema;

const BidsSchema = new schema({
    user: {
        type:schema.Types.ObjectId,
        ref:'user'
    },
    product: {
        type:schema.Types.ObjectId,
        ref:'product'
    },
}, { timestamps: true }
);


module.exports = mongoose.model('Bid', BidsSchema);