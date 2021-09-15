const { createTag, readTags } = require("../model/tagsModel");
const postModel = require("../model/pollPostModel");
const response = {};

class TagController {
  createTagController = (req, res, next) => {
    let data = {
      name: req.body.name,
      location: req.body.location,
      createdBy: req.token._id,
      modifiedBy: req.token._id,
    };
    // console.log(data);
    createTag(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "Tag created successfully.";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };
  readTagsController = (req, res, next) => {
    let data = {
      location: req.query.value,
    };
    // console.log(data);
    readTags(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "All tags !";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };
  trendingPostsController = (req, res, next) => {
    let data = {
      location: req.query.value,
    };
    // console.log(data);
    postModel.trendingPosts(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "All trending posts !";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };
}

module.exports = new TagController();
