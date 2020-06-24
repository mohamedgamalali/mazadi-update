const jwt = require('jsonwebtoken');

const privateKey = process.env.ADMIN_JWT_PRIVATE_KEY;

module.exports = (req,res,next)=>{
    

      const authHeader = req.get('Authorization');
      if(!authHeader){
          const error = new Error('not Authorized!!');
          error.statusCode = 401;
          throw error;
      }
      const token =req.get('Authorization').split(' ')[1];
      
      let decodedToken;

        decodedToken = jwt.verify(token,privateKey);

        if(!decodedToken){
            const error = new Error('not Authorized!!');
            error.statusCode = 401;
            throw error;
        }
            
        req.userId = decodedToken.adminId;
       
        next();
};