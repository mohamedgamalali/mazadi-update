const express      = require('express');
const {body}       = require('express-validator');
const session = require('express-session');
const flash = require('connect-flash')
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const path      = require('path');
const router  = express.Router();
const csrf         = require('csurf');

const isNotAuth = require('../meddleWere/isNotAuth');
const isAuth    = require('../meddleWere/isAuth');

const adminController = require('../controllers/admin');



const MONGODB_URI = process.env.MONGODB_URI ;



  const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

router.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store:store
  })
);



router.use(flash());
router.use(bodyParser.urlencoded({ extended: false }));
//csrf Proticyion
const csrfProtection = csrf();

router.use(csrfProtection);
router.use((req,res,next)=>{
  res.locals.csrfToken = req.csrfToken();
  next();
});
                                                      //routs


//auth
router.get('/login',isNotAuth,adminController.getLogin);
router.post('/login',isNotAuth,adminController.postLogin);
router.get('/logout',isAuth,adminController.getlogOut);

//admin pid manage

router.post('/start',isAuth,adminController.postStart);
router.post('/end',isAuth,adminController.postEnd);

//admin
router.get('',isAuth,adminController.getTest);
router.get('/support/f&q',isAuth,adminController.getFaQ);
router.post('/support/f&q',isAuth,[
  body('answer')
  .not().isEmpty(),
  body('ask')
  .not().isEmpty()
],adminController.postFaQ);
router.post('/AQ/delete',isAuth,adminController.deleteFaQ);
router.post('/approve/:type',isAuth,adminController.postApprove);
router.post('/disapprove/:type',isAuth,adminController.postdisApprove);
router.post('/support',isAuth,[
    body('answer')
    .not().isEmpty()
],adminController.postSupport);

router.post('/support/catigory',isAuth,[
  body('name')
  .not().isEmpty()
],adminController.postCatigory);


router.post('/support/catigory/edit',isAuth,[
  body('name') 
  .not().isEmpty()
],adminController.postEditCat);
router.get('/support',isAuth,adminController.getSupport);
router.get('/catigory',isAuth,adminController.getCatigory);
router.get('/support/:id',isAuth,adminController.getSingleSupport);
router.get('/approve',isAuth,adminController.getApprove);
router.get('/singleProduct/:id',isAuth,adminController.getSingleProduct);
router.get('/singleAsk/:id',isAuth,adminController.getSingleAsk);
router.get('/products',isAuth,adminController.getProducts);
router.get('/orders',isAuth,adminController.getOrders);
router.get('/users',isAuth,adminController.getUsers);
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