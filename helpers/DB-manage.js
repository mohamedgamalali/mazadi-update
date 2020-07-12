
const User = require('../models/user');

exports.notfications = async()=>{
    try{
        const user = await User.find({})
        //console.log(user);
        const copmDate = new Date()-518400000;
        
        for(u of user){
            for(n of u.notfications){
                if(new Date(Number(n.date))<= copmDate ){
                    console.log('day = ' + new Date(Number(n.date)).getDate());
                    
                    console.log(n);
                }
            }
            
        }
        
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          throw err;
    }
}