const path = require("path");
const { validationResult } = require("express-validator");

const Product = require("../models/products");
const User = require("../models/user");
const Catigory = require("../models/catigory");
const AskProduct = require("../models/askProduct");
const Prize = require("../models/prize");

const io = require("../socket.io/socket");

const deleteFile = require("../helpers/file");
const sendNotfication = require("../helpers/send-notfication");

exports.putProducts = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    const imageUrl = req.files;
    const helth = req.body.helth;
    const amount = req.body.amount;
    const color = req.body.color;
    const age = req.body.age;
    const desc = req.body.desc;
    const catigory = req.body.catigory;
    const production = req.body.production;
    const size = req.body.size;
    const sex = req.body.sex;
    const userId = req.userId;
    const adress = req.body.adress;
    const city = req.body.city;
    const price = Number(req.body.price);
    let image = [];
    let vid;
    if (!errors.isEmpty()) {
      const error = new Error("validation faild");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    if (imageUrl.length === 0) {
      const error = new Error("u should provide image");
      error.statusCode = 422;
      throw error;
    }
    if (!catigory) {
      const error = new Error("u should provide catigory");
      error.statusCode = 422;
      throw error;
    }
    imageUrl.forEach((f) => {
      if (path.extname(f.path) == ".mp4") {
        vid = f.path;
      } else {
        image.push(f.path);
      }
    });
    if (image.length === 0) {
      const error = new Error("u should provide image");
      error.statusCode = 422;
      throw error;
    }
    const newProduct = new Product({
      imageUrl: image,
      vidUrl: vid,
      helth: helth,
      amount: amount,
      color: color,
      age: age,
      desc: desc,
      catigory: catigory,
      user: userId,
      production: production,
      size: size,
      sex: sex,
      adress: adress,
      city: city,
      price: price,
    });

    const cat = await Catigory.findById(catigory);
    if (!cat) {
      const error = new Error("catigory can not be found");
      error.statusCode = 404;
      throw error;
    }

    const savedProduct = await newProduct.save();

    cat.products.push(savedProduct);
    await cat.save();

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not Found");
      error.statusCode = 404;
      throw error;
    }
    user.postedProducts.push(savedProduct);
    await user.save();
    res
      .status(200)
      .json({
        state: 1,
        message: "product created Sucessfullt",
        productId: savedProduct._id,
      });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  const catigory = req.params.catigoryId;
  const page = req.query.page || 1;
  const productPerPage = 10;
  const filter = req.query.filter || "1";
  let totalProducts;
  let products;

  try {
    if (filter == "1") {
      totalProducts = await Product.find({
        catigory: catigory,
        approve: "approved",
      })
        .where("bidStatus")
        .ne("ended")
        .countDocuments();
      products = await Product.find({ catigory: catigory, approve: "approved" })
        .where("bidStatus")
        .ne("ended")
        .sort({ createdAt: -1 })
        .select("approve")
        .select("imageUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("price")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    } else if (filter == "date") {
      totalProducts = await Product.find({
        catigory: catigory,
        approve: "approved",
      })
        .where("bidStatus")
        .ne("ended")
        .countDocuments();
      products = await Product.find({ catigory: catigory, approve: "approved" })
        .sort({ createdAt: -1 })
        .where("bidStatus")
        .ne("ended")
        .select("approve")
        .select("imageUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("price")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    } else if (filter == "bids") {
      totalProducts = await Product.find({
        catigory: catigory,
        approve: "approved",
      })
        .where("bidStatus")
        .ne("ended")
        .countDocuments();
      products = await Product.find({ catigory: catigory, approve: "approved" })
        .sort({ TotalPid: -1 })
        .where("bidStatus")
        .ne("ended")
        .select("approve")
        .select("imageUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("price")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    } else if (filter == "sold") { 
      totalProducts = await Product.find({ pay: true }).countDocuments();
      products = await Product.find({ pay: true })
        .sort({ createdAt: -1 })
        .select("approve")
        .select("imageUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("createdAt")
        .select("price")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    } else {
      totalProducts = await Product.find({
        catigory: catigory,
        approve: "approved",
        city: filter,
      })
        .where("bidStatus")
        .ne("ended")
        .countDocuments();
      products = await Product.find({
        catigory: catigory,
        approve: "approved",
        city: filter,
      })
        .sort({ createdAt: -1 })
        .where("bidStatus")
        .ne("ended")
        .select("approve")
        .select("imageUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("price")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    }

    return res
      .status(200)
      .json({ state: 1, products: products, totalItems: totalProducts });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAllProducts = async (req, res, next) => {
  const page = req.query.page || 1;
  const productPerPage = 10;
  const filter = req.query.filter || "date";
  let totalProducts;
  let products;

  try {
    if (filter == "1") {
      totalProducts = await Product.find({ approve: "approved" })
        .where("bidStatus")
        .ne("ended")
        .countDocuments();
      products = await Product.find({ approve: "approved" })
        .where("bidStatus")
        .ne("ended")
        .select("approve")
        .select("imageUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("price")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    } else if (filter == "date") {
      totalProducts = await Product.find({ approve: "approved" })
        .where("bidStatus")
        .ne("ended")
        .countDocuments();
      products = await Product.find({ approve: "approved" })
        .sort({ createdAt: -1 })
        .where("bidStatus")
        .ne("ended")
        .select("approve")
        .select("imageUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("price")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    } else if (filter == "bids") {
      totalProducts = await Product.find({ approve: "approved" })
        .where("bidStatus")
        .ne("ended")
        .countDocuments();
      products = await Product.find({ approve: "approved" })
        .sort({ TotalPid: -1 })
        .where("bidStatus")
        .ne("ended")
        .select("approve")
        .select("imageUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("price")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    } else if (filter == "sold") {
      totalProducts = await Product.find({ pay: true }).countDocuments();
      products = await Product.find({ pay: true })
        .sort({ createdAt: -1 })
        .select("approve")
        .select("imageUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("createdAt")
        .select("price")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    } else {
      totalProducts = await Product.find({ approve: "approved", city: filter })
        .where("bidStatus")
        .ne("ended")
        .countDocuments();
      products = await Product.find({ approve: "approved", city: filter })
        .where("bidStatus")
        .ne("ended")
        .select("approve")
        .select("imageUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("price")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    }

    return res
      .status(200)
      .json({ state: 1, products: products, totalItems: totalProducts });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getCatigory = async (req, res, next) => {
  try {
    let totalProducts = [];
    const totalOrders = [];
    const catigories = await Catigory.find({}).select({ products: 0 });
    const users = await User.find({}).countDocuments();

    if (catigories.length === 0) {
      const error = new Error("no catigory found!!..");
      error.statusCode = 404;
      throw error;
    }

    for (let find of catigories) {
      const totalPro = await Product.find({
        catigory: find._id,
        approve: "approved",
      })
      .where("bidStatus")
      .ne("ended")
      .countDocuments();
      const totalOr = await AskProduct.find({
        catigory: find._id,
        approve: "approved",
        ended: false,
      })
      .countDocuments();
      totalProducts.push(totalPro);
      totalOrders.push(totalOr);
    }

    res.status(200).json({
        state: 1,
        catigories: catigories,
        totalUsers: users,
        productPerCat: totalProducts,
        ordersPerCat: totalOrders,
      });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getSingleProduct = async (req, res, next) => {
  const prodId = req.params.id;
  let fev = false;

  try {
    const product = await Product.findById(prodId)
      .populate("user")
      .populate("catigory");
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("user not found!!..");
      error.statusCode = 404;
      throw error;
    }

    if (!product) {
      const error = new Error("product not found!!..");
      error.statusCode = 404;
      throw error;
    }
    if (product.approve === "binding" && req.userId != product.user._id) {
      const error = new Error("product not approved by the admin");
      error.statusCode = 401;
      throw error;
    }

    for (var i = 0; i < user.fevProducts.length; i++) {
      if (user.fevProducts[i] == prodId) {
        fev = true;
        break;
      }
    }
    res.status(200).json({
      state: 1,
      product: {
        TotalPid: product.TotalPid,
        vidUrl: product.vidUrl,
        _id: product._id,
        imageUrl: product.imageUrl,
        helth: product.helth,
        amount: product.amount,
        color: product.color,
        age: product.age,
        desc: product.desc,
        catigory: product.catigory.name,
        Type: product.Type,
        production: product.production,
        size: product.size,
        sex: product.sex,
        creatorId: product.user._id,
        createdAt: product.createdAt,
        approve: product.approve,
        lastBid: product.lastPid,
        userId: user._id,
        fev: fev,
        pay: product.pay,
        bidStatus: product.bidStatus,
        price: product.price,
        adress: product.adress,
        city: product.city,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getSingleAskProduct = async (req, res, next) => {
  const prodId = req.params.id;
  let bids = [];
  let owner = false;
  try {
    const askProduct = await AskProduct.findById(prodId)
      .populate("user")
      .populate("catigory");

    if (!askProduct) {
      const error = new Error("product not found!!..");
      error.statusCode = 404;
      throw error;
    }
    if (askProduct.approve === "binding") {
      const error = new Error("product not approved by the admin");
      error.statusCode = 401;
      throw error;
    }

    if (askProduct.user._id == req.userId) {
      bids = askProduct.Bids;
      owner = true;
    }

    res.status(200).json({
      state: 1,
      product: {
        TotalPid: askProduct.Bids.length,
        _id: askProduct._id,
        helth: askProduct.helth,
        amount: askProduct.amount,
        color: askProduct.color,
        age: askProduct.age,
        desc: askProduct.desc,
        catigory: askProduct.catigory.name,
        production: askProduct.production,
        size: askProduct.size,
        sex: askProduct.sex,
        creatorId: askProduct.user._id,
        createdAt: askProduct.createdAt,
        approve: askProduct.approve,
        ended: askProduct.ended,
        bids: bids,
        owner: owner,
        pay: askProduct.pay,
        adress: askProduct.adress,
        city: askProduct.city,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getSingleAskProductBid = async (req, res, next) => {
  const prodId = req.params.prodId;
  const bidId = req.params.bidId;
  let bid;
  try {
    const order = await AskProduct.findById(prodId)
      .select("Bids")
      .select("user")
      .select("ended")
      .select("pay");
    if (!order) {
      const error = new Error("order not found!!");
      error.statusCode = 404;
      throw error;
    }

    order.Bids.forEach((o) => {
      if (o._id == bidId) {
        bid = o;
      }
    });

    if (!bid) {
      const error = new Error("bid not found!!");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      stste: 1,
      bid: bid,
      pay: order.pay,
      ended: order.ended,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putPid = async (req, res, next) => {
  const prodId = req.body.prodId;
  const bidVal = req.body.bidVal;
  let find = false;
  try {
    const product = await Product.findByIdAndUpdate(prodId)
      .populate("user")
      .populate("lastPid");
    if (!product) {
      const error = new Error("product not found!!..");
      error.statusCode = 404;
      throw error;
    }

    if (product.user._id == req.userId) {
      const error = new Error("you can not pid in ur own product");
      error.statusCode = 401;
      throw error;
    }

    if (product.lastPid) {
      if (product.lastPid._id == req.userId) {
        const error = new Error("you should wait for some one to bid");
        error.statusCode = 401;
        throw error;
      }
    }

    if (product.bidStatus != "started") {
      const error = new Error("bid has to be started!!");
      error.statusCode = 401;
      throw error;
    }

    if (typeof bidVal !== "number") {
      const error = new Error("bidVal must be number");
      error.statusCode = 422;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("user not found!!..");
      error.statusCode = 404;
      throw error;
    }
    const before = product.TotalPid;
    const bidArrayItem = {
      user: req.userId,
      from: product.TotalPid,
      to: product.TotalPid + bidVal,
    };
    product.bidArray.push(bidArrayItem);
    const lastUser = product.lastPid;

    product.TotalPid += bidVal;

    product.lastPid = req.userId;
    const finalProduct = await product.save();
    const userPid = {
      product: prodId,
    };
    user.pids.forEach((p) => {
      if (p.product == prodId) {
        find = true;
      }
    });
    if (find == false) {
      user.pids.push(userPid);
    }
    const userAfter = await user.save();
    if (lastUser) {
      const body = {
        id: finalProduct._id.toString(),
        key: "2",
        data: "قام احد بالمزايده عليك",
      };
      const notfi = {
        title: `تمت المزايدة عليك`,
        body: "زايد مره اخرى لتتمكن من شراء المنتج",
      };

      const n = await sendNotfication.send(lastUser.FCMJwt, body, notfi, [
        lastUser._id,
      ]);
    }

    const body2 = {
      id: finalProduct._id.toString(),
      key: "2",
      data: "قام احد بالمزايده في منتجك",
    };
    const notfi2 = {
      title: ` قام احد بالمزايده في منتجك`,
      body: "راقب اخر التطورات",
    };

    const n2 = await sendNotfication.send(
      finalProduct.user.FCMJwt,
      body2,
      notfi2,
      [finalProduct.user._id]
    );

    io.getIO().emit("products", {
      action: "creat",
      productTotalPid: finalProduct.TotalPid,
      productId: finalProduct._id,
      creator: { _id: req.userId, name: userAfter.name },
    });
    res.status(201).json({
      state: 1,
      productTotalPid: finalProduct.TotalPid,
      productId: finalProduct._id,
      userId: userAfter._id,
      userName: userAfter.name,
      from: before,
      to: finalProduct.TotalPid,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putAskProduct = async (req, res, next) => {
  try {
    const desc = req.body.desc;
    const catigory = req.body.catigory;
    const city = req.body.city;
    const age = req.body.age;
    const sex = req.body.sex;
    const color = req.body.color;
    const amount = req.body.amount;
    const helth = req.body.helth;
    const size = req.body.size;
    const production = req.body.production;
    const adress = req.body.adress;

    const newAskProduct = new AskProduct({
      user: req.userId,
      products: [],
      desc: desc,
      age: age,
      sex: sex,
      adress: adress,
      color: color,
      amount: amount,
      helth: helth,
      size: size,
      production: production,
      catigory: catigory,
      city: city,
    });
    const askProduct = await newAskProduct.save();
    res.status(201).json({ state: 1, askProduct: askProduct });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAskProduct = async (req, res, next) => {
  const categoryID = req.params.categoryID;
  const page = req.query.page || 1;
  const productPerPage = 10;
  const filter = req.query.filter || "date";
  let total;
  let askProduct;
  try {
    if(categoryID==='1'){
      if (filter == "1") {
        total = await AskProduct.find({
          approve: "approved",
          ended: false,
        }).countDocuments();
        askProduct = await AskProduct.find({
          approve: "approved",
          ended: false,
        })
          .select("desc")
          .select("approve")
          .skip((page - 1) * productPerPage)
          .limit(productPerPage);
      } else if (filter == "date") {
        total = await AskProduct.find({
          approve: "approved",
          ended: false,
        }).countDocuments();
        askProduct = await AskProduct.find({
          approve: "approved",
          ended: false,
        })
          .sort({ createdAt: -1 })
          .select("desc")
          .select("approve")
          .skip((page - 1) * productPerPage)
          .limit(productPerPage);
      } else {
        total = await AskProduct.find({
          approve: "approved",
          city: filter,
          ended: false,
        }).countDocuments();
        askProduct = await AskProduct.find({
          approve: "approved",
          city: filter,
          ended: false,
        })
          .select("desc")
          .select("approve")
          .skip((page - 1) * productPerPage)
          .limit(productPerPage);
      }
    }else{
      
    if (filter == "1") {
      total = await AskProduct.find({
        catigory: categoryID,
        approve: "approved",
        ended: false,
      }).countDocuments();
      askProduct = await AskProduct.find({
        catigory: categoryID,
        approve: "approved",
        ended: false,
      })
        .select("desc")
        .select("approve")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    } else if (filter == "date") {
      total = await AskProduct.find({
        catigory: categoryID,
        approve: "approved",
        ended: false,
      }).countDocuments();
      askProduct = await AskProduct.find({
        catigory: categoryID,
        approve: "approved",
        ended: false,
      })
        .sort({ createdAt: -1 })
        .select("desc")
        .select("approve")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    } else {
      total = await AskProduct.find({
        catigory: categoryID,
        approve: "approved",
        city: filter,
        ended: false,
      }).countDocuments();
      askProduct = await AskProduct.find({
        catigory: categoryID,
        approve: "approved",
        city: filter,
        ended: false,
      })
        .select("desc")
        .select("approve")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    }
  }


    return res
      .status(200)
      .json({ state: 1, askProduct: askProduct, totalItems: total });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.putAskProductBid = async (req, res, next) => {
  try {
    const askProductId = req.body.askProductId;
    const imageUrl = req.files;
    const helth = req.body.helth;
    const city = req.body.city;
    const amount = req.body.amount;
    const price = Number(req.body.price);
    const color = req.body.color;
    const age = req.body.age;
    const desc = req.body.desc;
    const userId = req.userId;
    const adress = req.body.adress;
    const sex = req.body.sex;
    const size = req.body.size;
    const production = req.body.production;
    let image = [];
    let vid;
    if (imageUrl.length === 0) {
      const error = new Error("u should provide image");
      error.statusCode = 422;
      throw error;
    }

    imageUrl.forEach((f) => {
      if (path.extname(f.path) === ".mp4") {
        vid = f.path;
      } else {
        image.push(f.path);
      }
    });
    if (image.length === 0) {
      const error = new Error("u should provide image");
      error.statusCode = 422;
      throw error;
    }
    const Bid = {
      imageUrl: image,
      vidUrl: vid,
      helth: helth,
      city: city,
      amount: amount,
      price: price,
      color: color,
      age: age,
      desc: desc,
      user: userId,
      adress: adress,
      sex: sex,
      size: size,
      production: production,
    };
    const prod = await AskProduct.findById(askProductId).populate("user");
    if (prod.approve === "binding") {
      const error = new Error("admin did not approved to the bid yet");
      error.statusCode = 401;
      throw error;
    }
    if (prod.pay === true || prod.ended === true) {
      const error = new Error("bid ended!!");
      error.statusCode = 401;
      throw error;
    }

    prod.Bids.unshift(Bid);
    const finalProd = await prod.save();
    const user = await User.findById(userId);
    const body = {
      id: finalProd._id.toString(),
      key: "3",
      data: "قام احد باضافه عرض علي طلبك",
    };
    const notfi = {
      title: `قام احد بأضافة عرض على طلبك`,
      body: "يمكنك تصفح العروض",
    };

    const n = await sendNotfication.send(finalProd.user.FCMJwt, body, notfi, [
      finalProd.user._id,
    ]);
    io.getIO().emit("askProducts", {
      action: "creat",
      productAfterBid: { ...finalProd._doc },
      creator: { _id: user._id, name: user.name },
    });
    res.status(201).json({ state: 1 });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const productId = req.body.productId;
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("validation faild");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("product not found!!..");
      error.statusCode = 404;
      throw error;
    }
    if (product.user != req.userId) {
      const error = new Error("your are not the product owner!!");
      error.statusCode = 401;
      throw error;
    }
    if (product.pay == true) {
      const error = new Error("you can not delete after pay");
      error.statusCode = 401;
      throw error;
    }
    if (product.bidStatus == "started") {
      const error = new Error("you can not delete if the bid started");
      error.statusCode = 401;
      throw error;
    }
    product.imageUrl.forEach((i) => {
      deleteFile.deleteFile(path.join(__dirname + "/../" + i));
    });
    if (product.vidUrl) {
      deleteFile.deleteFile(path.join(__dirname + "/../" + product.vidUrl));
    }
    const Delete = await Product.findByIdAndDelete(productId);
    const catigory = await Catigory.findOne({ _id: product.catigory });
    const user = await User.findOne({ _id: req.userId });
    catigory.products.pull(productId);
    user.postedProducts.pull(productId);
    await user.save();
    await catigory.save();
    res.status(201).json({ state: 1, message: "product deleted!!" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postDeleteOrder = async (req, res, next) => {
  const orderId = req.body.orderId;
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("validation faild");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const order = await AskProduct.findById(orderId);
    if (!order) {
      const error = new Error("order not found!!..");
      error.statusCode = 404;
      throw error;
    }
    if (order.user != req.userId) {
      const error = new Error("your are not the order owner!!");
      error.statusCode = 401;
      throw error;
    }
    if (order.pay == true) {
      const error = new Error("you can not delete the order ater bid end");
      error.statusCode = 401;
      throw error;
    }
    order.Bids.forEach((f) => {
      if (f.vidUrl) {
        deleteFile.deleteFile(path.join(__dirname + "/../" + f.vidUrl));
      }
      f.imageUrl.forEach((i) => {
        deleteFile.deleteFile(path.join(__dirname + "/../" + i));
      });
    });
    const Delete = await AskProduct.findByIdAndDelete(orderId);

    res.status(201).json({ state: 1, message: "order deleted!!" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postRestart = async (req, res, next) => {
  const productId = req.body.productId;
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("validation faild");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const product = await Product.findById(productId).populate({path:'lastPid',select:'FCMJwt'});

    if (!product) {
      const error = new Error("product not found!!..");
      error.statusCode = 404;
      throw error;
    }
    if (product.user != req.userId) {
      const error = new Error("your are not the product owner!!");
      error.statusCode = 401;
      throw error;
    }
    if (product.pay == true) {
      const error = new Error("product sold");
      error.statusCode = 401;
      throw error;
    }
    if (product.bidStatus != "ended") {
      const error = new Error("bid has to be end");
      error.statusCode = 401;
      throw error;
    }
    if(product.lastPid){
      const body = {
        id: product._id.toString(),
        key: "2",
        data: "ناسف لقد تم نقل الحلال للمزاد القادم",
      };
      const notfi = {
        title: `ناسف لقد تم نقل الحلال للمزاد القادم`,
        body: "اذا كنت ترغب به يمكنك التواصل معنا",
      };
      await sendNotfication.send(product.lastPid.FCMJwt, body, notfi, [
        product.lastPid._id,
      ]);
    }
    
    await product.restartBid();

    res.status(200).json({ state: 1, message: "restarted" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.getPrize = async (req, res, next) => {
  const page        = req.query.page;
  const itemPerPage = 20; 

  try {
    
    const TotalPrizes = await Prize.find({})
    .countDocuments();
    const prizes = await Prize.find({})
    .sort({createdAt:-1})
    .skip((page - 1) * itemPerPage)
    .limit(itemPerPage);

    res.status(200).json({
      state:1,
      TotalPrizes:TotalPrizes,
      prizes:prizes,
    });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
