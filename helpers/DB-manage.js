
const User = require('../models/user');
const Notfication = require('../models/notfication');

exports.allNotficationClean = async()=>{
    try{
        const user = await User.find({ email: { $ne: "guest@guest.com" } }).select('notfications').lean();

        console.log(user);
        
        
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          throw err;
    }
}

exports.notfication = async()=>{
    try{
        const notfication = await Notfication.find({  }).select('notfications').lean();

        
        
        
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          throw err;
    }
}