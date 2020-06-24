const jwt = require('jsonwebtoken');

const privateKey = process.env.JWT_PRIVATE_KEY;
const User = require('../models/user');

module.exports = async (req,res,next)=>{
    const authHeader = req.get('Authorization');
    if(!authHeader){
        const error = new Error('not Authorized!!');
        error.statusCode = 401;
        throw error;
    }
    const token =req.get('Authorization').split(' ')[1];
    
    let decodedToken;
    try{

        decodedToken = jwt.verify(token,privateKey);

        if(!decodedToken){
            const error = new Error('not Authorized!!');
            error.statusCode = 401;
            throw error;
        }

        const user   = await User.findById(decodedToken.userId) ;

        if(!user){
            const error = new Error('user not found');
            error.statusCode = 404 ;
            throw error ;
        }

        if(user.verification==true){
            const error = new Error('تم حظرك من البرنامج لسوء الاستخدام');
            error.statusCode = 403 ;
            throw error ;
        }
            
        req.userId = decodedToken.userId;
       
        next();

    } catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
    
};