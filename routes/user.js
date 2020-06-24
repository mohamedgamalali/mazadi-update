const express      = require('express');
const {body}       = require('express-validator');

const router  = express.Router();

const userController = require('../controlers/user');

const isAuth         = require('../meddlewere/isAuth');
 

router.post('/fev/:action/:id',isAuth,userController.postFev);

router.delete('/deleteFev/:action/:id',isAuth,userController.deleteFev);

router.get('/profile/:id',isAuth,userController.getProfile);

router.get('/myBids',isAuth,userController.getMyBids);
 
router.get('/myProducts',isAuth,userController.getMyProducts);

router.get('/myAskProducts',isAuth,userController.getMyAskProducts);

router.get('/fev',isAuth,userController.getFev);

router.get('/notification',isAuth,userController.getNotification);

router.put('/editProfile',[
    body('name').trim(),
    body('email')
    .isEmail()
    .withMessage('please enter a valid email.')
    .normalizeEmail(),
    
],isAuth,userController.putEditProfile);


module.exports = router;