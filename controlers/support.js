const {validationResult} = require('express-validator');
const SupportMessages = require('../models/support-messages');
const FaQ = require('../models/f&Q');
const Ads = require('../models/Ads');
 
 exports.getFaQ = async (req,res,next)=>{

    try{
       
        const fAQ = await FaQ.find({});

        res.status(200).json({state:1,FaQ:fAQ}); 
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500; 
        }
        next(err);
    }
 };

 exports.putSupport = async (req,res,next)=>{
    const message = req.body.message ;
    const errors = validationResult(req);
 
    
    try{
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            throw error ; 
        }
        const newMessage = new SupportMessages({
            user:req.userId,
            message:message
        });
        const m = await newMessage.save(); 
        res.status(201).json({state:1,message:m.message});
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500; 
        }
        next(err);
    }
 };

 exports.getAds = async (req,res,next)=>{
    const filter = req.params.filter
    try{
       let ads;
       if(filter=='1'){
        ads = await Ads.find({type:'ads'}).sort({createdAt: -1});
       }
       else if(filter=='2'){
        ads = await Ads.find({type:'delivery'}).sort({createdAt: -1});
       }
       else if(filter=='3'){
        ads = await Ads.find({type:'helth'}).sort({createdAt: -1});
       }else{
        const error = new Error('invalid filter');
        error.statusCode = 422 ;
        throw error ; 
    }

        res.status(200).json({state:1,ads:ads}); 
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500; 
        }
        next(err);
    }
 };