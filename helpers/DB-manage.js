
const User = require('../models/user');
const Notfication = require('../models/notfication');

exports.allNotficationClean = async()=>{
    try{
        const user = await User.updateMany({ email: { $ne: "guest@guest.com" }}, {$set:{notfications: []}});

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
        const notfication = await Notfication.deleteMany({createdAt:{$lt: new Date().getTime()-432000000}});
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          throw err;
    }
}