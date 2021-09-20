const savePostModel = require("../model/savePostModel");
const response = {};

class SavePostController {
  savePostController = (req, res, next) => {
    let data = {
      userId: req.token._id,
      pollId: req.body.pollId,
      createdBy: req.token._id,
      modifiedBy: req.token._id,
    };
    savePostModel.savePost(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = data;
        // response.data = data;
        res.status(200).send(response);
      }
    });
  };
  unsavePostController = (req, res, next) => {
    let data = {
      userId: req.token._id,
      pollId: req.body.pollId,
    };
    savePostModel.unsavePost(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = data;
        // response.data = data;
        res.status(200).send(response);
      }
    });
  };
}

module.exports = new SavePostController();
