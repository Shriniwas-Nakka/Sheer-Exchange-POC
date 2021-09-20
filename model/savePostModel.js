const mongoose = require("mongoose");

const savePostSchemas = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pollposts",
      required: true,
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

const savePostModel = mongoose.model("saveposts", savePostSchemas);

const savePost = async (obj, callback) => {
  let data = await savePostModel.findOne({
    $and: [{ userId: obj.userId }, { pollId: obj.pollId }],
  });

  if (data) {
    callback(null, "Post already saved !");
  } else {
    savePostModel.create(obj, (error, data) => {
      if (error) {
        callback(error);
      } else {
        callback(null, data);
      }
    });
  }
};

const unsavePost = async (obj, callback) => {
  savePostModel.findOneAndRemove(
    {
      $and: [{ userId: obj.userId }, { pollId: obj.pollId }],
    },
    (error, data) => {
      if (error) {
        callback(error);
      } else {
        callback(null, data);
      }
    }
  );
};

module.exports = { savePostModel, savePost, unsavePost };
