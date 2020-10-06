
const Product = require('../models/products');
const sendNotfication = require('../helpers/send-notfication');

exports.startBid = async ()=>{
    try{
        const products = await Product.find({bidStatus:'binding',approve:'approved'});
        products.forEach(p=>{
            p.startBid();
        });
        if(products.length>0){
            const body = {
                id: ' ',
                key:'4',
                data:'نبدا المزاد ونقول بسم الله'
            };
            const notfi= {
                title:`نبدا المزاد ونقول بسم الله`,
                body:'عطو المنتجات حقها وان شاء الله مارح يقصرون ملاكها'
            };
            const n = await sendNotfication.sendAll(body,notfi);
            
    }
        
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500; 
        }
        throw(err);
    }
};

exports.endBid = async ()=>{
    try{
        const products = await Product.find({bidStatus:'started',approve:'approved'}).populate('user').populate('lastPid');
        products.forEach( p=>{
            
            if(p.lastPid==null){
                const Sbody = {
                    id: p._id.toString(),
                    key:'5',
                    data: p.TotalPid.toString()
                };
                const Snotfi= {
                    title:`للأسف لم يقم احد بالمزايده على منتجك`,
                    body:'يمكنك الانتظار لمزاد غدا او يمكنك حذف المنتج'
                };
                const n =  sendNotfication.send(p.user.FCMJwt,Sbody,Snotfi,[p.user._id]);
            
            }else if(p.TotalPid<p.price){
                const Sbody = {
                    id: p._id.toString(),
                    key:'5',
                    data: p.TotalPid.toString()
                };
                const Snotfi= {
                    title:`للاسف لم يصل منتجك للسعر المطلوب`,
                    body:'يمكنك التواصل مع المشتري وبيع المنتج او الانتظار ليصل إلى السعر المناسب غداَ'
                };
                const n =  sendNotfication.send(p.user.FCMJwt,Sbody,Snotfi,[p.user._id]);
            }
            else{
                const Sbody = {
                    id: p._id.toString(),
                    key:'5',
                    data: p.TotalPid.toString()
                };
                const Snotfi= {
                    title:`تهانينا وصل منتجك للسعر المطلوب`,
                    body:'يمكنك الان التواصل مع المشتري'
                };
                const n = sendNotfication.send(p.user.FCMJwt,Sbody,Snotfi,[p.user._id]);
            }
            
            p.endtBid();
            
        });
        if(products.length>0){
            const body = {
                id: ' ',
                key:'4',
                data:'تم انتهاء المزاد'
            };
            const notfi= {
                title:`انتهى المزاد وانتظرونا غدا`,
                body:'دقايق ورح يبارك التطبيق للاعضاء اللي فازو معانا والله يعوض البايع واللي ما حالفه الحظ بالافضل'
            };
            const n = sendNotfication.sendAll(body,notfi);
                    
        }
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500; 
        }
        throw(err);
    }
};