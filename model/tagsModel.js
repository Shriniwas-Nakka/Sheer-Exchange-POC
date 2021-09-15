const mongoose = require("mongoose");
const trendCalculator = require("../middleware/trendData");
const normalizedPosts = require("../middleware/normalizeValues");

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mentions: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      required: true,
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

const tagModel = mongoose.model("tags", tagSchema);

const createTag = (obj, callback) => {
  tagModel.create(obj, (error, data) => {
    if (error) {
      callback(error);
    } else {
      callback(null, data);
    }
  });
};

const readTags = (obj, callback) => {
  let query = obj.location ? { location: obj.location } : {};
  tagModel
    .find(query, (error, data) => {
      if (error) {
        callback(error);
      } else {
        // data.map(
        //   (value) =>
        //     console.log(
        //       "created",
        //       new Date(value.createdAt).getTime(),
        //       "updated",
        //       new Date(value.updatedAt).getTime()
        //     )
        //   //   console.log(
        //   //     ((new Date(value.updatedAt).getTime() -
        //   //       new Date(value.createdAt).getTime()) /
        //   //       new Date(value.createdAt).getTime()) *
        //   //       100
        //   //   )
        // );

        // let trendData = data.length > 0 ? data.sort(last_mention) : [];
        // let newTrendData = data.length > 0 ? trendData.sort(mentions) : [];
        // callback(null, newTrendData);

        let { trendingPosts, valuesPerTenMin } = trendCalculator(data);
        let newData = normalizedPosts(trendingPosts, valuesPerTenMin);
        // console.log(newData);

        newData.forEach(async (ele) => {
          //   console.log("--->", ele);
          ele.trendingValue = ele.normalizedMentions * 100;
          delete ele.normalizedMentions;
          delete ele.avgMentionsPerTenMin;
        });
        callback(
          null,
          newData.sort((a, b) => b.trendingValue - a.trendingValue)
        );
      }
    })
    .sort("createdAt");
};

const mentions = (a, b) => {
  if (a.mentions === b.mentions) return getTime(a) - getTime(b);
  return false;
};

function last_mention(a, b) {
  return getTime(a) - getTime(b);
}

getTime = (value) => {
  //   console.log(
  //     new Date(
  //       `${new Date(value.updatedAt).getMonth() + 1}/${new Date(
  //         value.updatedAt
  //       ).getDate()}/${new Date(value.updatedAt).getFullYear()}`
  //     ).getTime()
  //   );
  //   return new Date(
  //     `${new Date(value.updatedAt).getMonth() + 1}/${new Date(
  //       value.updatedAt
  //     ).getDate()}/${new Date(value.updatedAt).getFullYear()}`
  //   ).getTime();
  return new Date(value.updatedAt).getTime();
};

module.exports = { tagModel, createTag, readTags };
