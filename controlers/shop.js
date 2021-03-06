const path = require("path");
const { validationResult } = require("express-validator");

const Product = require("../models/products");
const User = require("../models/user");
const Catigory = require("../models/catigory");
const AskProduct = require("../models/askProduct");
const Prize = require("../models/prize");
const UserBids = require("../models/userBids");

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
    //update for form 3
    const owner = req.body.owner;
    const color2 = req.body.color2;
    const accident = req.body.accident;
    const colored = req.body.colored;
    const engineNumber = req.body.engineNumber;
    const Guarantee = req.body.Guarantee || 0 ;
    const productState = req.body.productState;
    const type = req.body.type;

    const price = Number(req.body.price);
    const bidStart = Number(req.body.bidStart) || 0;

    let image = [];
    let vid;
    let newProduct = {};
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


    const cat = await Catigory.findById(catigory);
    if (!cat) {
      const error = new Error("catigory can not be found");
      error.statusCode = 404;
      throw error;
    }
    if (cat.form == '1') {
      newProduct = new Product({
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
        TotalPid: bidStart,
        type:type
      });
    } else if (cat.form == '2') {
      newProduct = new Product({
        imageUrl: image,
        vidUrl: vid,
        helth: helth,
        amount: amount,
        age: age,
        desc: desc,
        catigory: catigory,
        user: userId,
        size: size,
        type: type,
        adress: adress,
        city: city,
        price: price,
        TotalPid: bidStart,
        productState: productState,
        Guarantee: Boolean(Number(Guarantee))
      });
    } else if (cat.form == '3') {
      newProduct = new Product({
        imageUrl: image,
        vidUrl: vid,
        owner: owner,
        color2: color2,
        accident: accident,
        colored: colored,
        engineNumber: engineNumber,
        type: type,
        helth: helth,
        age: age,
        color: color,
        Guarantee: Boolean(Number(Guarantee)),
        price: price,
        TotalPid: bidStart,
        city: city,
        adress: adress,
        desc: desc,
        user: userId,
        catigory: catigory,
        size: size,
        productState: productState
      });
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
        .select("vidUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("price")
        .select("adress")
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
        .select("vidUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("price")
        .select("adress")
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
        .select("vidUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("price")
        .select("adress")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    } else if (filter == "sold") {
      totalProducts = await Product.find({ pay: true }).countDocuments();
      products = await Product.find({ pay: true })
        .sort({ createdAt: -1 })
        .select("approve")
        .select("imageUrl")
        .select("vidUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("createdAt")
        .select("price")
        .select("adress")
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
        .select("vidUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("price")
        .select("adress")
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
        .select("vidUrl")
        .select("price")
        .select("adress")
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
        .select("vidUrl")
        .select("price")
        .select("adress")
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
        .select("vidUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("price")
        .select("adress")
        .skip((page - 1) * productPerPage)
        .limit(productPerPage);
    } else if (filter == "sold") {
      totalProducts = await Product.find({ pay: true }).countDocuments();
      products = await Product.find({ pay: true })
        .sort({ createdAt: -1 })
        .select("approve")
        .select("imageUrl")
        .select("vidUrl")
        .select("desc")
        .select("size")
        .select("TotalPid")
        .select("createdAt")
        .select("price")
        .select("adress")
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
        .select("vidUrl")
        .select("desc")
        .select("size")
        .select("TotalPid") 
        .select("price")
        .select("adress")
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
    const catigories = await Catigory.find({hide:{$ne:true}}).select({ products: 0 });
    const users      = await User.find({}).countDocuments();

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
    const product = await Product.findById(prodId).lean()
      .populate({ path: "catigory", select: 'name form' })
      .select('-price');

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
      product:{
        ...product,
        lastBid:product.lastPid
      },
      fev: fev
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
    let askProduct = await AskProduct.findById(prodId)
      .populate({path:"catigory",select:'name form'});

    if (!askProduct) {
      const error = new Error("product not found!!..");
      error.statusCode = 404;
      throw error;
    }
    if (askProduct.user._id != req.userId && askProduct.approve == 'binding') {
      const error = new Error("product not approved by the admin");
      error.statusCode = 401;
      throw error;
    }

    if (askProduct.user._id == req.userId) {
      bids = askProduct.Bids;
      owner = true;
    }

    const approvedBids = askProduct.Bids.filter(ask=>{
      return ask.offerApprove == 'approved' ;
    });
    askProduct.Bids = approvedBids ;


    res.status(200).json({
      state: 1,
      product: askProduct,
      owner:owner
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

    const ifBid = await UserBids.findOne({product:finalProduct._id,user:req.userId});

    if(!ifBid){
      const newBids = new UserBids({
        user:user._id,
        product:finalProduct._id
      });
      await newBids.save() ;
    }

    user.pids = [] ;
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
    //update
    const productState = req.body.productState;
    const color2 = req.body.color2;
    const engineSize = req.body.engineSize;
    const Guarantee = req.body.Guarantee;
    const type = req.body.type;

    let askProduct;

    const cat = await Catigory.findById(catigory);
    if (!cat) {
      const error = new Error("catigory can not be found");
      error.statusCode = 404;
      throw error;
    }
    if (cat.form == '1') {
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
        catigory: cat._id,
        city: city,
        type:type
      });
      askProduct = await newAskProduct.save();
    } else if (cat.form == '2') {
      const newAskProduct = new AskProduct({
        user: req.userId,
        products: [],
        desc: desc,
        age: age,
        sex: sex,
        adress: adress,
        amount: amount,
        helth: helth,
        size: size,
        catigory: cat._id,
        city: city,
        productState: productState,
        Guarantee: Boolean(Number(Guarantee)),
        type:type
      });
      askProduct = await newAskProduct.save();
    } else if (cat.form == '3') {
      const newAskProduct = new AskProduct({
        user: req.userId,
        products: [],
        desc: desc,
        age: age,
        sex: sex,
        adress: adress,
        color: color,
        helth: helth,
        catigory: cat._id,
        city: city,
        productState: productState,
        color2: color2,
        engineSize: engineSize,
        Guarantee: Boolean(Number(Guarantee)),
        type:type
      });
      askProduct = await newAskProduct.save();
    }

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
    if (categoryID === '1') {
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
          .select("adress")
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
          .select("adress")
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
          .select("adress")
          .skip((page - 1) * productPerPage)
          .limit(productPerPage);
      }
    } else {

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
          .select("adress")
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
          .select("adress")
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
          .select("adress")
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
    if (!prod) {
      const error = new Error("order not found");
      error.statusCode = 404;
      throw error;
    }
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
    
    await UserBids.deleteMany({product:productId}) ;

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
    const product = await Product.findById(productId).populate({ path: 'lastPid', select: 'FCMJwt' });

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
    if (product.lastPid) {
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
  const page = req.query.page;
  const itemPerPage = 20;

  try {

    const TotalPrizes = await Prize.find({})
      .countDocuments();
    const prizes = await Prize.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * itemPerPage)
      .limit(itemPerPage);

    res.status(200).json({
      state: 1,
      TotalPrizes: TotalPrizes,
      prizes: prizes,
    });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


//edit product / ask

exports.postEditProduct = async (req, res, next) => {
  const productId = req.body.productId;


  const imageUrl = req.files;
  const helth = req.body.helth;
  const amount = req.body.amount;
  const color = req.body.color;
  const age = req.body.age;
  const desc = req.body.desc;
  const production = req.body.production;
  const size = req.body.size;
  const sex = req.body.sex;
  const userId = req.userId;
  const adress = req.body.adress;
  const city = req.body.city;
  //update for form 3
  const owner = req.body.owner;
  const color2 = req.body.color2;
  const accident = req.body.accident;
  const colored = req.body.colored;
  const engineNumber = req.body.engineNumber;
  const Guarantee = req.body.Guarantee;
  const productState = req.body.productState;
  const type = req.body.type;

  const price = Number(req.body.price);
  const bidStart = Number(req.body.bidStart) || 0;

  let image = [];
  let vid;
  let newProduct = {};


  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("validation faild");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const product = await Product.findById(productId).populate({ path: 'catigory', select: 'form' });

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

    if (product.approve != "disapprove") {
      const error = new Error("bid has to be disapproved");
      error.statusCode = 401;
      throw error;
    }

    if (imageUrl) {
      imageUrl.forEach((f) => {
        if (path.extname(f.path) == ".mp4") {
          vid = f.path;
        } else {
          image.push(f.path);
        }
      });
    }


    if (product.catigory.form == '1') {
      if (image.length > 0) {

        product.imageUrl.forEach(i => {
          deleteFile.deleteFile(path.join(__dirname + "/../" + i));

        });

        product.imageUrl = image;

      }
      if (vid) {

        deleteFile.deleteFile(path.join(__dirname + "/../" + product.vidUrl));

        product.vidUrl = vid;

      }
      product.helth = helth;
      product.amount = amount;
      product.color = color;
      product.age = age;
      product.desc = desc;
      product.production = production;
      product.size = size;
      product.sex = sex;
      product.adress = adress;
      product.city = city;
      product.price = price;
      product.TotalPid = bidStart;
      product.type = type ;

      product.approve = 'binding';

      newProduct = await product.save();

    } else if (product.catigory.form == '2') {

      if (image.length > 0) {

        product.imageUrl.forEach(i => {
          deleteFile.deleteFile(path.join(__dirname + "/../" + i));

        });

        product.imageUrl = image;

      }
      if (vid) {

        deleteFile.deleteFile(path.join(__dirname + "/../" + product.vidUrl));

        product.vidUrl = vid;

      }

      product.helth = helth;
      product.amount = amount;
      product.color = color;
      product.age = age;
      product.desc = desc;
      product.user = userId;
      product.production = production;
      product.size = size;
      product.adress = adress;
      product.city = city;
      product.price = price;
      product.TotalPid = bidStart;
      product.type = type ;
      product.approve = 'binding';


      newProduct = await product.save();


    } else if (product.catigory.form == '3') {

      if (image.length > 0) {

        product.imageUrl.forEach(i => {
          deleteFile.deleteFile(path.join(__dirname + "/../" + i));

        });

        product.imageUrl = image;

      }
      if (vid) {

        deleteFile.deleteFile(path.join(__dirname + "/../" + product.vidUrl));

        product.vidUrl = vid;

      }

      product.owner = owner;
      product.color2 = color2;
      product.accident = accident;
      product.colored = colored;
      product.engineNumber = engineNumber;
      product.helth = helth;
      product.age = age;
      product.color = color;
      product.Guarantee = Boolean(Number(Guarantee));
      product.price = price;
      product.TotalPid = bidStart;
      product.city = city;
      product.adress = adress;
      product.desc = desc;
      product.size = size;
      product.productState = productState;
      product.type = type ;
      product.approve = 'binding';


      newProduct = await product.save();


    }





    res.status(200).json({ state: 1, message: "edited", afterEdit: newProduct });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.postEditAskProduct = async (req, res, next) => {
  try {
    const desc = req.body.desc;
    const productId = req.body.productId;
    const city = req.body.city;
    const age = req.body.age;
    const sex = req.body.sex;
    const color = req.body.color;
    const amount = req.body.amount;
    const helth = req.body.helth;
    const size = req.body.size;
    const production = req.body.production;
    const adress = req.body.adress;

    //update
    const productState = req.body.productState;
    const color2 = req.body.color2;
    const engineSize = req.body.engineSize;
    const Guarantee = req.body.Guarantee;
    const type = req.body.type;

    let newAskProduct;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("validation faild");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const askProduct = await AskProduct.findById(productId).populate({ path: 'catigory', select: 'form' });

    if (!askProduct) {
      const error = new Error("product not found!!..");
      error.statusCode = 404;
      throw error;
    }

    if (askProduct.user != req.userId) {
      const error = new Error("your are not the product owner!!");
      error.statusCode = 401;
      throw error;
    }

    if (askProduct.pay == true) {
      const error = new Error("product sold");
      error.statusCode = 401;
      throw error;
    }

    if (askProduct.approve != "disapprove") {
      const error = new Error("bid has to be disapproved");
      error.statusCode = 401;
      throw error;
    }

    if (askProduct.catigory.form == '1') {


      askProduct.desc = desc;
      askProduct.age = age;
      askProduct.sex = sex;
      askProduct.adress = adress;
      askProduct.color = color;
      askProduct.amount = amount;
      askProduct.helth = helth;
      askProduct.size = size;
      askProduct.production = production;
      askProduct.city = city;
      askProduct.type = type;
      askProduct.approve = 'binding';


      newAskProduct = await askProduct.save();

    } else if (askProduct.catigory.form == '2') {

      askProduct.desc = desc;
      askProduct.age = age;
      askProduct.sex = sex;
      askProduct.adress = adress;
      askProduct.amount = amount;
      askProduct.helth = helth;
      askProduct.size = size;
      askProduct.city = city;
      askProduct.productState = productState;
      askProduct.Guarantee = Boolean(Number(Guarantee));
      askProduct.type = type;
      askProduct.approve = 'binding';

      newAskProduct = await askProduct.save();

    } else if (askProduct.catigory.form == '3') {
     
    
      askProduct.desc = desc;
      askProduct.age = age;
      askProduct.sex = sex;
      askProduct.adress = adress;
      askProduct.color = color;
      askProduct.helth = helth;
      askProduct.city =  city;
      askProduct.productState = productState;
      askProduct.color2 = color2;
      askProduct.engineSize = engineSize;
      askProduct.Guarantee = Boolean(Number(Guarantee));
      askProduct.type = type;
      askProduct.approve = 'binding';

      newAskProduct = await askProduct.save();

    }

    res.status(201).json({ state: 1, askProduct: newAskProduct });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
