const express      = require('express');
const {body}       = require('express-validator');

const router  = express.Router();

const shopController = require('../controlers/shop');

const isAuth         = require('../meddlewere/isAuth');

router.post('/addProduct',[
    body('catigory')
    .not().isEmpty(),
    body('price')
    .not().isEmpty(),
],isAuth,shopController.putProducts);

router.post('/product/delete',[
    body('productId')
    .not().isEmpty()
],isAuth,shopController.postDeleteProduct);

router.post('/order/delete',[
    body('orderId')
    .not().isEmpty()
],isAuth,shopController.postDeleteOrder);

router.get('/getProducts/:catigoryId',isAuth,shopController.getProducts); //catigoryId?page='+page

router.get('/products/all',isAuth,shopController.getAllProducts); //catigoryId?page='+page

router.get('/getCatigory',shopController.getCatigory); 

router.get('/getSingleProduct/:id',isAuth,shopController.getSingleProduct); 

router.get('/SingleAskProduct/:id',isAuth,shopController.getSingleAskProduct); 

router.get('/SingleAskProduct/bid/:prodId/:bidId',isAuth,shopController.getSingleAskProductBid); 

router.put('/putPid',isAuth,shopController.putPid); 


// Ask for Product
router.put('/putAskProduct',isAuth,shopController.putAskProduct); 

router.get('/getAskProduct/:categoryID',isAuth,shopController.getAskProduct); 


router.post('/putAskProductBid',isAuth,shopController.putAskProductBid);

router.post('/bid/restart',[
    body('productId')
    .not().isEmpty()
],isAuth,shopController.postRestart); 

router.get('/prize',isAuth,shopController.getPrize);

//edit 
router.post('/product/edit',[
    body('productId')
    .not().isEmpty(),
    body('price')
    .not().isEmpty(),

],isAuth,shopController.postEditProduct);

router.post('/AskProduct/edit',[
    body('productId')
    .not().isEmpty(),
],isAuth,shopController.postEditAskProduct);



module.exports = router;