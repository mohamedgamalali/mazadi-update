const express      = require('express');

const {body}       = require('express-validator');

const router  = express.Router();

const supportController = require('../controlers/support');

const isAuth         = require('../meddlewere/isAuth');

router.put('/support',[
    body('message')
    .not().isEmpty()
],isAuth,supportController.putSupport);

router.get('/support/FaQ',isAuth,supportController.getFaQ);
router.get('/ads/:filter',isAuth,supportController.getAds);

module.exports = router;