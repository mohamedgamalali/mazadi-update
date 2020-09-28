const { validationResult } = require('express-validator');
const validatePhoneNumber = require('validate-phone-number-node-js');

const Product = require('../models/products');
const User = require('../models/user');
const Catigory = require('../models/catigory');
const AskProduct = require('../models/askProduct');
const Notfications = require("../models/notfication");
const UserBids = require("../models/userBids");



exports.postFev = async (req, res, next) => {
    const action = req.params.action;
    const id = req.params.id;


    try {
        const user = await User.findById(req.userId);

        if (!user) {
            const error = new Error('User not Found');
            error.statusCode = 404;
            throw error;
        }
        if (action == 1) {
            const product = await Product.findById(id);
            if (!product) {
                const error = new Error('Product not Found');
                error.statusCode = 404;
                throw error;
            }
            if (user.fevProducts.length > 0) {
                user.fevProducts.forEach(element => {
                    if (element == id) {
                        const error = new Error('product allready exists!!');
                        error.statusCode = 401;
                        throw error;
                    }
                });
            }
            user.fevProducts.push(id);
            const newUser = await user.save();
        }
        if (action == 2) {
            const product = await AskProduct.findById(id);
            if (!product) {
                const error = new Error('Product not Found');
                error.statusCode = 404;
                throw error;
            }
            if (user.fevProducts.length > 0) {
                user.fevAskProduct.forEach(element => {
                    if (element == id) {
                        const error = new Error('product allready exists!!');
                        error.statusCode = 401;
                        throw error;
                    }
                });
            }
            user.fevAskProduct.push(id);
            const newUser = await user.save();
        }
        res.status(201).json({ state: 1, message: "product added to fev successfully!!" });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};



exports.deleteFev = async (req, res, next) => {
    const action = req.params.action;
    const id = req.params.id;

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            const error = new Error('User not Found');
            error.statusCode = 404;
            throw error;
        }
        if (action == 1) {
            const product = await Product.findById(id);
            if (!product) {
                const error = new Error('Product not Found');
                error.statusCode = 404;
                throw error;
            }
            user.fevProducts.pull(id);
        }
        if (action == 2) {
            const product = await AskProduct.findById(id);
            if (!product) {
                const error = new Error('Product not Found');
                error.statusCode = 404;
                throw error;
            }

            user.fevAskProduct.pull(id);
        }
        await user.save();
        res.status(201).json({ state: 1, message: "product fev deleted successfully!!" });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.getProfile = async (req, res, next) => {
    const profileId = req.params.id;

    try {
        let user, flag;
        if (profileId == req.userId) {
            flag = 'owner';

            user = await User.findById(profileId)
                .select('name')
                .select('mobile')
                .select('email');

            if (!user) {
                const error = new Error('User not Found');
                error.statusCode = 404;
                throw error;
            }

        } else {
            flag = 'visitor';
            user = await User.findById(profileId)
                .select('name')
                .select('mobile')
                .select('email');
            if (!user) {
                const error = new Error('User not Found');
                error.statusCode = 404;
                throw error;
            }
        }

        res.status(200).json({ state: 1, profileState: flag, user: user });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.putEditProfile = async (req, res, next) => {
    const errors = validationResult(req);

    const email = req.body.email;
    const mobile = req.body.mobile;
    const name = req.body.name;

    const validMobile = validatePhoneNumber.validate(mobile);

    try {
        if (!errors.isEmpty()) {
            const error = new Error('validation faild');
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }

        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('user not found');
            error.statusCode = 404;
            throw error;
        }
        if (user.email !== email) {
            const checkUser = await User.findOne({ email: email }).select('email');
            if (checkUser) {
                const error = new Error('البريد الالكتروني موجود بالفعل');
                error.statusCode = 422;
                throw error;
            }
            //send verification email first
            user.email = email;
        }
        if (user.mobile !== mobile) {
            if (!validMobile) {
                const error = new Error('ادخل رقم هاتف صحيح');
                error.statusCode = 422;
                throw error;
            }
            const checkUser = await User.findOne({ mobile: mobile }).select('email');
            if (checkUser) {
                const error = new Error('الهاتف موجود بالفعل');
                error.statusCode = 422;
                throw error;
            }
            user.mobile = mobile;
        }
        if (user.name !== name) {
            user.name = name;
        }
        const newUser = await user.save();
        res.status(201).json({
            state: 1,
            name: newUser.name,
            email: newUser.email,
            mobile: newUser.mobile,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getMyBids = async (req, res, next) => {

    const page = req.query.page || 1;
    const productPerPage = 10;

    try {
        // const user = await User.findById(req.userId).select('pids.product').populate('pids.product');
        // let totalBids = user.pids.length;
        // if (!user) {
        //     const error = new Error('user not found');
        //     error.statusCode = 404;
        //     throw error;
        // }
        // let start = (page - 1) * productPerPage;
        // let c = 0;
        // for (count = start; count < user.pids.length; count++) {
        //     if (c < productPerPage) {
        //         if (user.pids[count].product != null) {
        //             userAfterPaginate.push({
        //                 approve: user.pids[count].product.approve,
        //                 imageUrl: user.pids[count].product.imageUrl,
        //                 desc: user.pids[count].product.desc,
        //                 _id: user.pids[count].product._id,
        //                 price: user.pids[count].product.price,
        //                 TotalPid: user.pids[count].product.TotalPid
        //             });
        //         } else {
        //             totalBids--;
        //         }
        //         c++;
        //     } else {
        //         break;
        //     }
        // }
        const userBids = await UserBids.find({user:req.userId})
        .skip((page - 1) * productPerPage)
        .limit(productPerPage)
        .sort({ createdAt: -1 })
        .select('product')
        .populate({path:'product',select:'approve imageUrl desc price TotalPid'});
        const total = await UserBids.find({user:req.userId}).countDocuments();

        let final = [] ;

        userBids.forEach(i=>{
            final.push(i.product);
        });

        res.status(200).json({ state: 1, myBeds: final, totalBids: total });


    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.getMyProducts = async (req, res, next) => {

    const page = req.query.page || 1;
    const productPerPage = 10;
    try {
        // const user = await User.findById(req.userId).select('postedProducts').populate('postedProducts');
        // let totalBids = user.postedProducts.length;
        // if (!user) {
        //     const error = new Error('user not found');
        //     error.statusCode = 404;
        //     throw error;
        // }
        // let start = (page - 1) * productPerPage;
        // let c = 0;
        // for (count = start; count < user.postedProducts.length; count++) {
        //     if (c < productPerPage) {
        //         if (user.postedProducts[count] != null) {
        //             userAfterPaginate.push({
        //                 approve: user.postedProducts[count].approve,
        //                 imageUrl: user.postedProducts[count].imageUrl,
        //                 desc: user.postedProducts[count].desc,
        //                 _id: user.postedProducts[count]._id,
        //                 TotalPid: user.postedProducts[count].TotalPid,
        //                 price: user.postedProducts[count].price
        //             });
        //         } else {
        //             totalBids--;
        //         }
        //         c++;
        //     } else {
        //         break;
        //     }
        // }
        const myProducts = await Product.find({user:req.userId,pay:false})
        .select('approve imageUrl desc TotalPid price')
        .skip((page - 1) * productPerPage)
        .limit(productPerPage)
        .sort({ createdAt: -1 }) ;

        const totalBids = await Product.find({user:req.userId,pay:false})
        .countDocuments();

        res.status(200).json({ state: 1, myProducts: myProducts, totalProducts: totalBids });


    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getMyAskProducts = async (req, res, next) => {

    const page = req.query.page || 1;
    const productPerPage = 10;
    try {
        const totalAskProduct = await AskProduct.find({ user: req.userId }).countDocuments();
        const askProduct = await AskProduct.find({ user: req.userId })
            .select('desc')
            .select('approve')
            .skip((page - 1) * productPerPage)
            .limit(productPerPage);


        res.status(200).json({ state: 1, myProducts: askProduct, totalProducts: totalAskProduct });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.getFev = async (req, res, next) => {

    const page = req.query.page || 1;
    const productPerPage = 10;
    let userProducts = [];
    try {
        const user = await User.findById(req.userId)
            .select('fevProducts')
            .populate('fevProducts');
        if (!user) {
            const error = new Error('user not found');
            error.statusCode = 404;
            throw error;
        }
        let totalFevProducts = user.fevProducts.length;
        let start = (page - 1) * productPerPage;
        let c = 0;
        let count = 0;
        for (count = start; count < totalFevProducts; count++) {
            if (c < productPerPage) {
                if (user.fevProducts[count] != null) {
                    userProducts.push({
                        imageUrl: user.fevProducts[count].imageUrl,
                        desc: user.fevProducts[count].desc,
                        approve: user.fevProducts[count].approve,
                        _id: user.fevProducts[count]._id,
                        price: user.fevProducts[count].price,
                        TotalPid: user.fevProducts[count].TotalPid
                    });
                } else {
                    totalFevProducts--;
                }
                c++;
            } else {
                break;
            }
        }
        res.status(200).json({ state: 1, myFevProducts: userProducts, totalProducts: totalFevProducts });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.getNotification = async (req, res, next) => {
    const page = req.query.page || 1;
    const itemBerPage = 10;
    const notf = [];
    try {

        const totalNotfi = await Notfications.find({ user: req.userId }).countDocuments();
        const userNotfi = await Notfications.find({ user: req.userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * itemBerPage)
            .limit(itemBerPage);
        for (N of userNotfi) {
            notf.push({
                notfication: N,
            });
        }

        res.status(200).json({ state: 1, Notifications: notf, totalNotfi: totalNotfi });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};