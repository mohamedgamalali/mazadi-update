const express      = require('express');
const {body}       = require('express-validator');

const router  = express.Router();

const isAuth    = require('../meddleWere/isAuth');

const adminController = require('../controllers/admin');


                                                      //routs


//auth
router.post('/login',[
  body('email')
  .not().isEmpty(),
  body('password')
  .not().isEmpty()
],adminController.postLogin);                              //REST API

//admin pid manage

router.post('/start',isAuth,adminController.postStart);    //REST API
router.post('/end',isAuth,adminController.postEnd);        //REST API

//admin
router.get('',isAuth,adminController.getTest);             //REST API
router.get('/support/f&q',isAuth,adminController.getFaQ);  //REST API
router.post('/support/f&q',isAuth,[                        //REST API
  body('answer')
  .not().isEmpty(),
  body('ask')
  .not().isEmpty()
],adminController.postFaQ);
router.post('/AQ/delete',isAuth,[                        //REST API
  body('id')
  .not().isEmpty()
],adminController.deleteFaQ);           
router.post('/approve/:type',isAuth,adminController.postApprove); //REST API
router.post('/disapprove/:type',isAuth,[                        
  body('id')
  .not().isEmpty(),
  body('note')
  .not().isEmpty()
],adminController.postdisApprove); //REST API

router.post('/support',isAuth,[
    body('answer')
    .not().isEmpty(),
    body('id')
    .not().isEmpty()
],adminController.postSupport);   //REST API

router.post('/support/catigory',isAuth,[    //REST API
  body('name')
  .not().isEmpty()
],adminController.postCatigory);


router.post('/support/catigory/edit',isAuth,[
  body('name') 
  .not().isEmpty(),
  body('id') 
  .not().isEmpty()
],adminController.postEditCat);           //REST API

router.get('/support',isAuth,adminController.getSupport);           //REST API
router.get('/catigory',isAuth,adminController.getCatigory);         //REST API
router.get('/support/:id',isAuth,adminController.getSingleSupport);                           ////////no need
router.get('/singleProduct/:id',isAuth,adminController.getSingleProduct);  //REST API
router.get('/singleAsk/:id',isAuth,adminController.getSingleAsk);        //REST API
router.get('/products',isAuth,adminController.getProducts);        //REST API
router.get('/orders',isAuth,adminController.getOrders);           //REST API
router.get('/users',isAuth,adminController.getUsers);             //REST API
router.get('/singleUser/:id',isAuth,adminController.getSingleUsers);  //REST API
router.post('/delete/:type',isAuth,adminController.postDelete);
router.get('/Ads',isAuth,adminController.getAds);
router.post('/ads/edit',isAuth,adminController.postEditAds);
router.post('/ads/delete',isAuth,adminController.postDeleteAds);
router.post('/ads/add',isAuth,adminController.postAddAds);
router.get('/lost',isAuth,adminController.getLost);
router.post('/lost/delete',isAuth,adminController.postDeleteLost);

//pay
router.get('/pay',isAuth,adminController.getPay);

router.get('/sendPay/product/:action/:id',isAuth,adminController.getSendPayProduct);


router.post('/pay/send/:action',isAuth,adminController.postSendPayProduct);

router.post('/pay/:action',isAuth,adminController.postPay);

//send notfication
router.post('/notfication',
[
  body('title') 
  .not().isEmpty(),
  body('body') 
  .not().isEmpty()
],isAuth,adminController.postSendNotfication);

//block
router.post('/block',isAuth,adminController.postBlock);



module.exports = router;