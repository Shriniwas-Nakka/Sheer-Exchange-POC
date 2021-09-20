const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pollposts",
      //   required: true,
      index: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    notificationType: {
      type: String,
      enum: ["VOTE", "COMMENT", "FOLLOW", "MENTION", "LIKE"],
      required: true,
    },
    isViewed: {
      type: Boolean,
      default: false,
    },
    isArcheived: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const notificationModel = mongoose.model("notifications", notificationSchema);

createNotification = (obj, callback) => {
  notificationModel.create(obj, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

readNotifications = (obj, callback) => {
  //   console.log("----->", obj);
  notificationModel
    .find({ to: obj.userId }, (err, result) => {
      if (err) {
        callback(err);
      } else {
        // console.log("notifications", result);
        callback(err, result);
      }
    })
    .populate("pollId")
    .populate("from")
    .sort("-createdAt");
};

viewNotification = (obj, callback) => {
  notificationModel.findById(obj.notificationId, (err, result) => {
    if (err) {
      callback(err);
    } else {
      if (result) {
        if (result.isViewed) {
          callback(null, "notification is already viewed !");
        } else {
          notificationModel.findByIdAndUpdate(
            obj.notificationId,
            {
              isViewed: true,
            },
            { new: true },
            (err, result) => {
              if (err) {
                callback(err);
              } else {
                callback(null, result);
              }
            }
          );
        }
      } else {
        callback(null, "notification does not exists !");
      }
    }
  });
};

deleteNotification = (obj, callback) => {
  console.log(obj);
  notificationModel.findByIdAndRemove(obj.id, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

module.exports = {
  notificationModel,
  readNotifications,
  viewNotification,
  createNotification,
  deleteNotification,
};
