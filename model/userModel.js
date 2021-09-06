const mongoose = require("mongoose");
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
                _id : result._id,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                mobileNumber: result.mobileNumber,
                role: result.role,
                profileUrl: result.profileUrl,
              };
              let token = await jwt.accessToken(obj);
              let data = {
                _id : result._id,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                mobileNumber: result.mobileNumber,
                role: result.role,
                profileUrl: result.profileUrl,
                token: token.token,
              };
              await callback(null, data);
            }
          }
        );
      }
    });
  };
}

module.exports = new UserModel();
