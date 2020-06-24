const express      = require('express');

const router  = express.Router();

const payController = require('../controlers/pay');

const isAuth         = require('../meddlewere/isAuth');



router.post('/pay',isAuth,payController.postPay);

router.post('/pay/info',isAuth,payController.getPay);

router.post('/pay/order/select',isAuth,payController.postOrderNotf);

router.post('/pay/order',isAuth,payController.postOrderPay);

router.post('/pay/order/info',isAuth,payController.notfiTest);

router.post('/pay/manual/product',isAuth,payController.postPayManProd);

router.post('/pay/manual/order',isAuth,payController.postPayManOrder);

module.exports = router;