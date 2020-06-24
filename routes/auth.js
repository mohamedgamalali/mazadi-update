const express      = require('express');
const {body}       = require('express-validator');

const router  = express.Router();

const User = require('../models/user');
const authController = require('../controlers/auth');
const isAuth = require('../meddlewere/isAuth');
router.put('/signup',[
    body('email')
    .isEmail()
    .withMessage('please enter a valid email.')
    .normalizeEmail()
    .custom((value,{req})=>{
        return User.findOne({email:value})
        .then(result=>{
            if(result){
                return Promise.reject('E-mail allready exists!');
            }
        })
    }),
    body('password','enter a password with only number and text and at least 5 characters.')
    .isLength({min:5})
    .trim()
    ,
    body('comfirmPassword')
    .trim()
    .custom((value,{req})=>{
        if(value!=req.body.password){
            return Promise.reject('password has to match');
        }
        return true ;
    }),
    body('name').not().isEmpty().trim(),
    body('mobile')
    .not().isEmpty()
    .custom((value,{req})=>{
        return User.findOne({mobile:value})
        .then(result=>{
            if(result){
                return Promise.reject('phone allready exists!');
            }
        })
    })
],authController.putSignup);

router.post('/login',[
    body('emailOrPhone')
    .not().isEmpty(),
    body('password')
    .not().isEmpty(),
],authController.postLogin);

//forget password
router.post('/forgetPassword',[
    body('email')
    .isEmail()
    .withMessage('please enter a valid email.')
    .normalizeEmail()
    .custom((value,{req})=>{
        return User.findOne({email:value})
        .then(result=>{
            if(!result){
                return Promise.reject('E-mail not found');
            }
        })
    })
],authController.postForgetPassword);

router.post('/verfyCode',[
    body('code')
    .not().isEmpty()
],isAuth, authController.postVerfyCode);

router.post('/logout',[
    body('FCM')
    .not().isEmpty()
],isAuth, authController.postLogout);

router.put('/forgetPassword',[
    body('password','enter a password with only number and text and at least 5 characters.')
    .isLength({min:5})
    .trim(),
    body('comfirmPassword')
    .custom((value,{req})=>{
        if(value!=req.body.password){
            return Promise.reject('password has to match');
        }
        return true ;
    }).trim()
],isAuth,authController.putForgetPassword);

module.exports = router;