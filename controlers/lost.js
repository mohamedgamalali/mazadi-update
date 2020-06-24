const Lost = require('../models/lost');
const deleteFile = require('../helpers/file');

const {validationResult} = require('express-validator');
const path = require('path');


exports.postLost  = async (req,res,next)=>{
    const phone    = req.body.phone;
    const desc     = req.body.desc;
    const imageUrl = req.files;
    const found    = Number(req.body.found);
    const errors   = validationResult(req);
 
    
    try{
        if(!errors.isEmpty()){
            const error = new Error('validation faild');
            error.statusCode = 422 ;
            error.data = errors.array();
            throw error ; 
        }
        if(imageUrl.length==0){
            const error = new Error('u should provide image');
            error.statusCode = 422 ;
            throw error ; 
        }
        const lost = new Lost({
            imageUrl:imageUrl[0].path,
            desc:desc,
            phone:phone,
            user:req.userId,
            found:Boolean(found)
        });
        const l = await lost.save();

        res.status(201).json({state:1,message:'created',l:l});
        
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}


exports.getLost  = async (req,res,next)=>{
    
    const filter = req.query.filter || 3;
    const page = req.query.page || 1 ;
    const productPerPage = 10 ;
    try{
        let totalLost; 
        let lost ;
        if(filter=='1'){
            totalLost = await Lost.find({found:true}).countDocuments();
            lost      = await Lost.find({found:true})
            .sort({createdAt: -1})
            .skip((page-1)*productPerPage)
            .limit(productPerPage);
        }
        else if(filter=='2'){
            totalLost = await Lost.find({found:false}).countDocuments();
            lost      = await Lost.find({found:false})
            .sort({createdAt: -1})
            .skip((page-1)*productPerPage)
            .limit(productPerPage);
        }else if(filter=='3'){
            totalLost = await Lost.find({}).countDocuments();
            lost      = await Lost.find({})
            .sort({createdAt: -1})
            .skip((page-1)*productPerPage)
            .limit(productPerPage);
        }else{
            const error = new Error('invalid filter');
            error.statusCode = 422 ;
            throw error ; 
        }

        res.status(200).json({state:1,lost:lost,total:totalLost});
        
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}


exports.deleteLost  = async (req,res,next)=>{
    
    const id = req.body.lostId;
    try{
       const lost = await Lost.findById(id);
       if(!lost){
        const error = new Error('not found');
        error.statusCode = 404 ;
        throw error ;
       }
       if(lost.user!=req.userId){
        const error = new Error('not authrized!! not your post');
        error.statusCode = 401 ;
        throw error ;
       }

        deleteFile.deleteFile( path.join(__dirname +"/../"+ lost.imageUrl));
        
        await Lost.findByIdAndDelete(id);

        res.status(200).json({state:1,message:'deleted'});
        
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}