const mongoose = require('mongoose');

const schema   = mongoose.Schema;

const productSchema = new schema({
    TotalPid:{
        type:Number,
        default:0
    },
    approve:{
        type:String,
        default:'binding'
    },
    imageUrl:[{
        type:String,
        required:true
    }],
    vidUrl:{
        type:String
    },
    bidStatus:{
        type:String,
        default:'binding'
    },
    user:{
        type:schema.Types.ObjectId,
        ref:'user'
    },
    helth:{
        type:String
    },
    catigory:{
        type:schema.Types.ObjectId,
        ref:'catigory'
    },lastPid:{
        type:schema.Types.ObjectId,
        ref:'user'
    },
    amount:{
        type:String
    },
    color:{
        type:String
    },
    age:{
        type:String
    },
    desc:{
        type:String
    },
    production:{
        type:String
    },
    size:{
        type:String
    },
    sex:{
        type:String
    },
    adress:{
        type:String
    },
    city:{
        type:String
    },
    price:{
        type:Number,
        required:true
    },
    pay:{
        type:Boolean,
        default:false
    }
  },
    {timestamps:true}
);

productSchema.methods.startBid = function(){
    this.bidStatus = 'started' ;
    this.lastPid   = null ;
    this.TotalPid  = 0 ;
    return this.save();
};

productSchema.methods.endtBid = function(){
    
    this.bidStatus = 'ended' ;
    
    return this.save();
};

productSchema.methods.restartBid = function(){
    
    this.bidStatus = 'binding' ;
    
    return this.save();
};

module.exports = mongoose.model('product',productSchema);