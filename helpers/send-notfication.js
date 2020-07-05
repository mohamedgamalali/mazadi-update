const admin = require("firebase-admin");
const User = require("../models/user");
const io = require("../socket.io/socket");

const send = async (token, b, notfi, userId) => {
  try {
    userId.forEach(async (u) => {
      try {
        const user = await User.findById(u);

        user.notfications.push({
          data: b,
          notification: notfi,
          date: new Date().getTime().toString(),
        });

        await user.save();
        io.getIO().emit("notfication", {
          action: "notfication",
          userId: u,
          notfications: {
            data: b,
            notification: notfi,
          },
        });
      } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        throw err;
      }
    });
    if (token.length == 0) {
      return "no token";
    }
    var message = {
      notification: {
        title: notfi.title,
        body: notfi.body,
      },
      data: {
        ...b,
      },
      android: {
        notification: {
          sound: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
      topic: "X",
      tokens: token,
    };

    const messageRes = await admin.messaging().sendMulticast(message);

    return messageRes;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    throw err;
  }
};

const sendAll = async (body, notfi) => {
  try {
    
    const users = await User.find({ email: { $ne: "guest@guest.com" } }).select('FCMJwt').lean();
    
    let result = [];
    let id = [];
    for (let u of users) {
      if (u.FCMJwt.length > 0) {
        result = result.concat(u.FCMJwt);
        id = id.concat(u._id);
      }
      if (result.length >= 450) {
        const R = result;
        const I = id;
        await send(R, body, notfi, I);
        result.length = [];
        id.length = [];
      }
    }

    const r = await send(result, body, notfi, id);

    return r;

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    throw err;
  }
};

exports.send = send;
exports.sendAll = sendAll;
