const mongoose = require("mongoose");
const { followModel } = require("./followModel.js");
const bcrypt = require("bcrypt");
const jwt = require("../middleware/middleware");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobileNumber: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileUrl: {
      type: String,
    },
    numberOfFollowers: { type: Number, default: 0 },
    numberOfFollowings: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["admin", "user", "guest"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("users", userSchema);

class UserModel {
  signUpUserModel = (obj, callback) => {
    userModel.create(obj, (error, result) => {
      if (error) {
        callback(error);
      } else {
        callback(null, result);
      }
    });
  };

  signInUserModel = (obj, callback) => {
    userModel.findOne({ email: obj.email }, async (error, result) => {
      if (error) {
        callback(error);
      } else if (result === null) {
        callback(null, result);
      } else {
        await bcrypt.compare(
          obj.password,
          result.password,
          async (err, data) => {
            if (err) {
              callback(err);
            } else {
              let obj = {
                _id: result._id,
                firstName: result.firstName,
                lastName: result.lastName,
                userName: result.userName,
                email: result.email,
                mobileNumber: result.mobileNumber,
                role: result.role,
                profileUrl: result.profileUrl,
                numberOfFollowings: result.numberOfFollowings,
                numberOfFollowers: result.numberOfFollowers,
              };
              let token = await jwt.accessToken(obj);
              let data = {
                _id: result._id,
                firstName: result.firstName,
                lastName: result.lastName,
                userName: result.userName,
                email: result.email,
                mobileNumber: result.mobileNumber,
                role: result.role,
                profileUrl: result.profileUrl,
                numberOfFollowings: result.numberOfFollowings,
                numberOfFollowers: result.numberOfFollowers,
                token: token.token,
              };
              await callback(null, data);
            }
          }
        );
      }
    });
  };

  getUsersBySearchModel = async (obj, callback) => {
    let findData = await userModel
      .find({
        $or: [
          { firstName: { $regex: obj.value, $options: "gi" } },
          { lastName: { $regex: obj.value, $options: "gi" } },
          { email: { $regex: obj.value, $options: "gi" } },
          { userName: { $regex: obj.value, $options: "gi" } },
        ],
      })
      .select("-password -createdAt -updatedAt -__v");
    callback(null, findData);
  };

  followUserModel = async (obj, callback) => {
    const session = await followModel.startSession();
    session.startTransaction();
    try {
      const options = { session };

      if (obj.action === "follow") {
        let findData = await followModel.findOne({
          $and: [
            { follower: obj.data.follower },
            { following: obj.data.following },
          ],
        });
        if (findData) {
          await session.abortTransaction();
          session.endSession();
          callback(null, "already following");
        } else {
          let data = await followModel.create([obj.data], options);
          await userModel
            .findByIdAndUpdate(
              obj.data.follower,
              {
                $inc: { numberOfFollowings: 1 },
              },
              { new: true }
            )
            .session(session);
          await userModel
            .findByIdAndUpdate(
              obj.data.following,
              {
                $inc: { numberOfFollowers: 1 },
              },
              { new: true }
            )
            .session(session);
          await session.commitTransaction();
          session.endSession();
          callback(null, data);
        }
      }

      if (obj.action === "unfollow") {
        let data = await followModel
          .findOneAndRemove({
            $and: [
              { follower: obj.data.follower },
              { following: obj.data.following },
            ],
          })
          .session(session);
        if (data) {
          await userModel
            .findByIdAndUpdate(
              obj.data.follower,
              {
                $inc: { numberOfFollowings: -1 },
              },
              { new: true }
            )
            .session(session);
          await userModel
            .findByIdAndUpdate(
              obj.data.following,
              {
                $inc: { numberOfFollowers: -1 },
              },
              { new: true }
            )
            .session(session);
          await session.commitTransaction();
          session.endSession();
          callback(null, "unfollowed successfully");
        } else {
          callback(null, "record not found");
        }
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      callback(error);
    }
  };

  listFollowerAndFollowingModel = async (obj, callback) => {
    let query =
      (await obj.filter) === "following"
        ? { follower: new mongoose.Types.ObjectId(obj.userId) }
        : { following: new mongoose.Types.ObjectId(obj.userId) };
    let populate = obj.filter === "following" ? "following" : "follower";

    let data = await followModel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: populate,
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          user: {
            _id: "$user._id",
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            userName: "$user.userName",
            email: "$user.email",
            mobileNumber: "$user.mobileNumber",
            role: "$user.role",
            profileUrl: "$user.profileUrl",
            numberOfFollowers: "$user.numberOfFollowers",
            numberOfFollowings: "$user.numberOfFollowings",
          },
        },
      },
      // {
      //   $group: {
      //     _id: "$user._id",
      //     firstName: { $firstName: "$user.$firstName" },
      //     // users:{
      //     //   id: "$user._id",
      //     //   firstName: "$user.firstName",
      //     // },
      //   },
      // },
      // { $limit: 1 },
    ]);

    let list = await data.map(async (user) => {
      let followingCount = await followModel
        .find({
          $and: [{ follower: obj.userId }, { following: user.user._id }],
        })
        .count();
      let followerCount = await followModel
        .find({
          $and: [{ follower: user.user._id }, { following: obj.userId }],
        })
        .count();
      let count = await this.userProfileAction(followingCount, followerCount);
      // console.log({ ...user.user, action: count });
      return await {
        ...user.user,
        action: count,
      };
    });
    Promise.all(list)
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error);
      });
  };

  getUserProfileModel = async (obj, callback) => {
    let userData = await userModel
      .findById(obj.user)
      .select("-password -createdAt -updatedAt -__v");
    let followingCount = await followModel
      .find({
        $and: [{ follower: obj.me }, { following: obj.user }],
      })
      .count();
    let followerCount = await followModel
      .find({
        $and: [{ follower: obj.user }, { following: obj.me }],
      })
      .count();

    callback(null, {
      ...userData._doc,
      action: await this.userProfileAction(followingCount, followerCount),
    });
  };

  userProfileAction = (followingCount, followerCount) => {
    let total = followingCount + followerCount;

    if (total === 0) {
      return 0; // Follow
    }
    if (total === 2) {
      return 1; // Following
    }
    if (followingCount > followerCount) {
      return 1; // Following
    }
    if (followingCount < followerCount) {
      return 2; // Follow back
    }
    // followingCount === followerCount && 0; //  follow
    // followerCount > followingCount && 1; // following
    // followerCount < followingCount && 2; // follow back
  };
}

module.exports = new UserModel();
