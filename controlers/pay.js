const User = require("../models/user");
const Product = require("../models/products");
const AskProduct = require("../models/askProduct");
const ProductPay = require("../models/product-man-pay");
const OrderPay = require("../models/order-man-pay");
const path = require("path");

const sendNotfication = require("../helpers/send-notfication");

exports.postPay = async (req, res, next) => {
  const productId = req.body.productId;
  try {
    const product = await Product.findOne({ _id: productId })
      .populate("lastPid")
      .populate("user");
    if (product.user._id != req.userId) {
      const error = new Error("you are not the product ouner");
      error.statusCode = 401;
      throw error;
    }

    if (product.pay === true) {
      const error = new Error("you have allready payed for this product");
      error.statusCode = 401;
      throw error;
    }

    product.pay = true;
    product.bidStatus = "ended";

    await product.save();

    const Sbody = {
      id: product._id.toString(),
      key: "6",
      data: "تهانينا تمت عمليه الدفع",
    };
    const Snotfi = {
      title: `تهانينا تمت عمليه الدفع`,
      body: ` اضغط لتصفح بيانات المشتري `,
    };
    const n = await sendNotfication.send(product.user.FCMJwt, Sbody, Snotfi, [
      product.user._id,
    ]);

    res.status(201).json({
      state: 1,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPay = async (req, res, next) => {
  const productId = req.body.productId;
  try {
    const product = await Product.findById(productId)
      .populate("user")
      .populate("lastPid");

    if (!product) {
      const error = new Error("product not found");
      error.statusCode = 404;
      throw error;
    }
    if (product.pay == false) {
      const error = new Error("you should pay first");
      error.statusCode = 400;
      throw error;
    }
    if (product.user._id != req.userId) {
      const error = new Error("you are noth the product ouner");
      error.statusCode = 401;
      throw error;
    }

    const clintBody = {
      id: product._id.toString(),
      key: "2",
      data: "تهانينا لقد فزت بالمزاد",
    };
    const clintNotfi = {
      title: `تهانينا لقد فزت بالمزاد`,
      body: "انتظر حتى يتواصل معك صاحب الحلال",
    };
    await sendNotfication.send(product.lastPid.FCMJwt, clintBody, clintNotfi, [
      product.lastPid._id,
    ]);

    res.status(200).json({
      state: 1,
      product: {
        _id: product._id,
        desc: product.desc,
        imageUrl: product.imageUrl,
      },
      lastPid: {
        userName: product.lastPid.name,
        userEmail: product.lastPid.email,
        userPhone: product.lastPid.mobile,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postOrderNotf = async (req, res, next) => {
  const bidId = req.body.bidId;
  const orderId = req.body.orderId;
  let bid = [];
  try {
    const order = await AskProduct.findById(orderId);

    if (!order) {
      const error = new Error("order not found!!");
      error.statusCode = 404;
      throw error;
    }

    if (order.user != req.userId) {
      const error = new Error("you are not the order owner");
      error.statusCode = 401;
      throw error;
    }

    if (order.ended == true) {
      const error = new Error("bid ended!!");
      error.statusCode = 401;
      throw error;
    }

    order.ended = true;

    order.Bids.forEach((o) => {
      if (o._id == bidId) {
        o.selected = true;
        bid.push(o);
      }
    });
    if (bid.length > 0) {
      const user = await User.findById(bid[0].user);
      console.log(bid[0].user);

      const Sbody = {
        id: order._id.toString() + " " + bidId,
        key: "7",
        data: bid[0].price.toString(),
      };
      const Snotfi = {
        title: ` تم اختيار العرض الخاص بك`,
        body: `الرجاء الدفع للحصول علي بيانات المشتري`,
      };
      const n = await sendNotfication.send(user.FCMJwt, Sbody, Snotfi, [
        user._id,
      ]);
    }

    await order.save();
    //send notfication to the user who made the bid to pay
    res.status(200).json({ state: 1, message: "notfication sent" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postOrderPay = async (req, res, next) => {
  const orderId = req.body.orderId;
  const bidId = req.body.bidId;

  let bid = [];

  try {
    const order = await AskProduct.findById(orderId).populate("user");
    const user = await User.findById(req.userId);
    if (!order) {
      const error = new Error("order not found!!");
      error.statusCode = 404;
      throw error;
    }

    if (order.ended == false) {
      const error = new Error("owner have not select bid yet");
      error.statusCode = 401;
      throw error;
    }

    order.Bids.forEach((o) => {
      if (o._id == bidId && o.selected == true) {
        bid.push(o);
      }
    });

    if (bid.length == 0) {
      const error = new Error("bid not found");
      error.statusCode = 404;
      throw error;
    }

    order.pay = true;
    await order.save();
    const Sbody = {
      id: order._id.toString() + " " + bidId.toString(),
      key: "8",
      data: "تم الدفع للطلب بنجاح",
    };
    const Snotfi = {
      title: `تم الدفع للطلب بنجاح `,
      body: `اضغط لتصفح بيانات المشتري لعرضك`,
    };
    const n = await sendNotfication.send(user.FCMJwt, Sbody, Snotfi, [
      user._id,
    ]);

    res.status(201).json({
      state: 1,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.notfiTest = async (req, res, next) => {
  const orderId = req.body.orderId;
  let bidId;
  try {
    const order = await AskProduct.findById(orderId).populate("user");

    if (!order) {
      const error = new Error("order not found");
      error.statusCode = 404;
      throw error;
    }

    if (order.pay == false) {
      const error = new Error("you should pay first");
      error.statusCode = 400;
      throw error;
    }

    order.Bids.forEach((o) => {
      if (o.selected == true) {
        bidId = o._id;
      }
    });

    res.status(200).json({
      state: 1,
      order: {
        _id: order._id,
        desc: order.desc,
        bidId: bidId,
      },
      orderOwner: {
        userName: order.user.name,
        userEmail: order.user.email,
        userPhone: order.user.mobile,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//manula pay

exports.postPayManProd = async (req, res, next) => {
  const productId = req.body.productId;
  const imageUrl = req.files;
  try {
    const product = await Product.findById(productId)
      .populate("user")
      .populate("lastPid");
    if (!product) {
      const error = new Error("product not found");
      error.statusCode = 404;
      throw error;
    }
    if (product.pay == true) {
      const error = new Error("you already payed");
      error.statusCode = 422;
      throw error;
    }
    if (product.user._id != req.userId) {
      const error = new Error("you are not the product ouner");
      error.statusCode = 401;
      throw error;
    }
    if (!product.lastPid) {
      const error = new Error("لم يقم احد بالمزايده");
      error.statusCode = 422;
      throw error;
    }

    const pay = new ProductPay({
      user: req.userId,
      data: product.lastPid,
      products: product,
      pillImage: imageUrl[0].path,
    });

    await pay.save();

    res.status(201).json({ state: 1 });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postPayManOrder = async (req, res, next) => {
  const orderId = req.body.orderId;
  const bidId = req.body.bidId;
  const imageUrl = req.files;
  let bid = [];
  try {
    const order = await AskProduct.findById(orderId).populate("user");
    if (!order) {
      const error = new Error("product not found");
      error.statusCode = 404;
      throw error;
    }
    if (order.pay == true) {
      const error = new Error("you already payed");
      error.statusCode = 400;
      throw error;
    }

    order.Bids.forEach((o) => {
      if (o._id == bidId && o.selected == true) {
        bid.push(o);
      }
    });
    if (bid.length == 0) {
      const error = new Error(
        "bid not found or may not be selected from the owner"
      );
      error.statusCode = 404;
      throw error;
    }

    const pay = new OrderPay({
      user: req.userId,
      data: order.user._id,
      order: order,
      pillImage: imageUrl[0].path,
      price: bid[0].price,
    });

    await pay.save();

    res.status(201).json({ state: 1 });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
