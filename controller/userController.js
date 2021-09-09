const userModel = require("../model/userModel");
const bcrypt = require("../middleware/middleware");
const response = {};

class UserController {
  signUpUserController = (req, res, next) => {
    let data = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      role: req.body.role,
      profileUrl: req.body.profileUrl,
      password: bcrypt.hashPassword(req.body.password),
    };
    console.log(data);
    userModel.signUpUserModel(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "User Created !";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };

  signInUserController = (req, res, next) => {
    let data = {
      email: req.body.email,
      password: req.body.password,
    };
    userModel.signInUserModel(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "User Created !";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };

  getUsersBySearchController = (req, res, next) => {
    let data = {
      value: req.query.value,
    };
    userModel.getUsersBySearchModel(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "User Created !";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };

  followUserController = (req, res, next) => {
    let data = {
      action: req.params.action,
      data: {
        follower: req.token._id,
        following: req.params.userId,
      },
    };
    userModel.followUserModel(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "Followed Successfully !";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };

  listFollowerAndFollowingController = (req, res, next) => {
    let data = {
      filter: req.params.filter,
      userId: req.params.userId,
    };
    userModel.listFollowerAndFollowingModel(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = `List of ${req.params.filter}`;
        response.data = data;
        res.status(200).send(response);
      }
    });
  };

  getUserProfileController = (req, res, next) => {
    let data = {
      me: req.token._id,
      user: req.params.userId,
    };
    userModel.getUserProfileModel(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "User profile !";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };
}

module.exports = new UserController();
