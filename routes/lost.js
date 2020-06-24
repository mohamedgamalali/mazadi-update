
const express      = require('express');
const {body}       = require('express-validator');

const router  = express.Router();

const lostController = require('../controlers/lost');
const isAuth = require('../meddlewere/isAuth');

router.post('/lost',[
    body('desc')
    .not().isEmpty(),
    body('phone')
    .not().isEmpty()
],isAuth,lostController.postLost);

router.get('/lost',isAuth,lostController.getLost);

router.delete('/lost',[
    body('lostId')
    .not().isEmpty()
],isAuth,lostController.deleteLost);


module.exports = router;