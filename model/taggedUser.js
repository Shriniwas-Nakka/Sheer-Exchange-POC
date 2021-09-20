const mongoose = require("mongoose");
const { notificationModel } = require("./notificationModel");

const tagggedUserSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pollposts",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    taggedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

const taggedUserModel = mongoose.model("taggedusers", tagggedUserSchema);

taggedUserModel.watch().on("change", (change) => {
  // console.log("watch tag users", change);
  if (change.operationType === "insert") {
    let data = {
      pollId: change.fullDocument.pollId,
      to: change.fullDocument.taggedUserId,
      from: change.fullDocument.createdBy,
      notificationType: "MENTION",
      createdBy: change.fullDocument.createdBy,
      modifiedBy: change.fullDocument.createdBy,
    };
    // console.log("--777s7", data);
    notificationModel.create(data, (err, data) => {
      if (err) {
        console.log(data);
      } else {
        console.log(data);
      }
    });
  }
});

module.exports = { taggedUserModel };
