const bycript = require('bcryptjs');
const {check,validationResult} = require('express-validator');
const validatePhoneNumber = require('validate-phone-number-node-js');
const jwt     = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/user');


const transport  = nodemailer.createTransport({
    host: 'az1-ts1.a2hosting.com',
    port: 465,
    secure: true, 
    auth: {
      user:process.env.NODEMAILER_GMAIL,
      pass:process.env.NODEMAILER_PASS
    }
  });

exports.putSignup = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        throw error ; 
    }
    const email     = req.body.email;
    const password  = req.body.password;
    const name      = req.body.name;
    const mobile    = req.body.mobile;
    const validMobile    = validatePhoneNumber.validate(mobile); 
    if(!validMobile){
        const error = new Error('invalid mobile number!!');
        error.statusCode = 422;
        throw error;
    }
    bycript.hash(password,12).then(hashedPass=>{
        const newUser = new User({
            email:email,
            password:hashedPass,
            name:name,
            mobile:mobile,
        });
        return newUser.save();
    })   
    .then(user=>{
       return res.status(201).json({state:1,message:'user created',userId:user._id});
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.postLogin = async (req,res,next)=>{
    try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        throw error ; 
    }
    const emailOrPhone     = req.body.emailOrPhone;
    const password         = req.body.password;
    const FCM              = req.body.FCM;
    const isEmail          = emailOrPhone.search('@');
    
    
        let user;
        if(isEmail>=0){
            await check('emailOrPhone').isEmail().normalizeEmail().run(req);   
            user = await User.findOne({email:req.body.emailOrPhone}) 
        }else{
            console.log("mobile:" + req.body.emailOrPhone);
            user = await User.findOne({mobile:emailOrPhone})
        }
            if(!FCM){
                const error = new Error('FCM is required');
                error.statusCode = 410 ;
                throw error ;
            }
            if(!user){
                const error = new Error('مستخدم غير موجود');
                error.statusCode = 404 ;
                throw error ;
            }    
            const isEqual = await bycript.compare(password,user.password);
            if(!isEqual){
                const error = new Error('كلمه السر غير صحيحه');
                error.statusCode = 401 ;
                throw error ;
            }
            if(user.verification==true){
                const error = new Error('تم حظرك من البرنامج لسوء الاستخدام');
                error.statusCode = 403 ;
                throw error ;
            }
            const index =  user.FCMJwt.indexOf(FCM);
            if(index==-1 && user.email!='guest@guest.com'){
                user.FCMJwt.push(FCM);
                await user.save();
            }
            
            
            const token  = jwt.sign(
                {
                    email:user.email,
                    userId:user._id.toString()
                },
                process.env.JWT_PRIVATE_KEY
            );

            const totalUsers = await User.find({}).countDocuments();

            res.status(200).json({
                state:1,
                totalUsers:totalUsers,
                token:token,
                userName:user.name,
                userEmail:user.email,
                userMobile:user.mobile ,
                userId:user._id
            });
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
    
    
};

exports.postLogout = async (req,res,next)=>{
    const FCM = req.body.FCM ;
    try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        throw error ; 
    }
    const user = await User.findById(req.userId);
    const index = user.FCMJwt.indexOf(FCM);
    if(index>-1){
        user.FCMJwt.splice(index, 1);
    }
    await user.save();
    res.status(201).json({state:1,message:'FCM deleted'});
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
    
    
};



exports.postForgetPassword = async (req,res,next)=>{
        const email = req.body.email;
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            throw error ; 
        }
        const user = await User.findOne({email:email});
        
        const buf = crypto.randomBytes(3).toString('hex');
        const hashedCode = await bycript.hash(buf,12)
        user.forgetPasswordCode = hashedCode;
        user.codeExpireDate =  Date.now()  + 3600000 ;
        await user.save();
        await transport.sendMail({
            to:email,
            from:process.env.NODEMAILER_GMAIL + " mazadi",
            subject:'Reset password',
            html:`
            <h1>Reset password</h1>
            <br><h4>that's your code to reset your password</h4>
            <br><h3>${buf}</h3>
            `
          });
          const token  = jwt.sign(
            {
                email:user.email,
                userId:user._id.toString()
            },
            process.env.JWT_PRIVATE_KEY,
            {expiresIn:'1h'}
         );
          res.status(200).json({state:1,message:'تم ارسال الكود بنجاح.',token:token});
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
    
    
};



exports.postVerfyCode = async (req,res,next)=>{
    const code  = req.body.code;
try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        throw error ; 
    }
    const user = await User.findById(req.userId);
    if(!user){
        const error = new Error('User not Found');
        error.statusCode = 404 ;
        throw error ;
    }  
    const match = await bycript.compare(code,user.forgetPasswordCode)
    if(!match){
        const error = new Error('wrong code!!');
        error.statusCode = 401 ;
        throw error ;
    }
    if(user.codeExpireDate<=Date.now()){
        const error = new Error('your code is expired');
        error.statusCode = 401 ;
        throw error ;
    }
    
    res.status(200).json({state:1,message:'كود صحيح'})
    
}catch(err){
    if(!err.statusCode){
        err.statusCode = 500;
    }
    next(err);
}

};

exports.putForgetPassword = (req,res,next)=>{
    const password  = req.body.password;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation faild');
        error.statusCode = 422 ;
        error.data = errors.array();
        throw error ; 
    }


    User.findById(req.userId).then(user=>{
        if(!user){
            const error = new Error('User not Found');
            error.statusCode = 404 ;
            throw error ;
        }
    
        bycript.hash(password,12).then(hashed=>{
            console.log(hashed);
            
            user.password = hashed ;
            return user.save();
        });
        
    }).then(u=>{
        res.status(201).json({state:1,message:"تم تغيير كلمه السر"});
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};