const userModel = require("../model/userModel");
const bcrypt = require("../middleware/middleware");
const response = {};

class UserController {
  signUpUserController = (req, res, next) => {
    let data = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
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
}

module.exports = new UserController();
