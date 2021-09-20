// const pollPostService = require("../service/pollPostService");
const pollPostModel = require("../model/pollPostModel");
const response = {};

class PollPostController {
  createPollPostController = (req, res, next) => {
    if (req.token.role === "user") {
      let data = {
        post: {
          subject: req.body.subject,
          description: req.body.description ?? null,
          duration: req.body.duration ?? 86400000,
          location: req.body.location,
          taggedUsers:
            req.body.taggedUsers.length > 0 ? req.body.taggedUsers : [],
          tags: req.body.tags.length > 0 ? req.body.tags : [],
          createdBy: req.token._id,
          modifiedBy: req.token._id,
        },
        question: { question: req.body.pollQuestion },
        options: { option: req.body.pollOptions },
      };
      pollPostModel.create(data, (error, data) => {
        if (error) {
          response.status = false;
          response.message = error.message;
          response.error = error;
          res.status(400).send(response);
        } else {
          response.status = true;
          response.message = "Poll post created successfully.";
          // response.data = data;
          res.status(200).send(response);
        }
      });
    } else {
      return res.status(401).send({
        status: false,
        message: "Unauthorized user !",
      });
    }
  };

  readPollPostsController = (req, res, next) => {
    let data = {
      userId: req.token._id,
      key: req.query.key,
      value: req.query.key === "COUNTRY" && req.query.value,
    };
    // console.log(data);
    pollPostModel.read(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "Retrieved all posts";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };

  updatePollPostsController = (req, res, next) => {
    if (req.token.role === "user") {
      let data = {
        pollId: req.body.pollId,
        questionId: req.body.questionId,
        post: {
          subject: req.body.subject,
          description: req.body.description ?? null,
          duration: req.body.duration ?? 86400000,
          location: req.body.location,
          modifiedBy: req.token._id,
        },
        question: { question: req.body.pollQuestion },
      };
      // console.log(data);

      pollPostModel.update(data, (error, data) => {
        if (error) {
          response.status = false;
          response.message = error.message;
          response.error = error;
          res.status(400).send(response);
        } else {
          response.status = true;
          response.message = "Poll post updated successfully.";
          res.status(200).send(response);
        }
      });
    } else {
      return res.status(401).send({
        status: false,
        message: "Unauthorized user !",
      });
    }
  };

  addOptionToPollPostsController = (req, res, next) => {
    if (req.token.role === "user") {
      let data = {
        pollId: req.body.pollId,
        newOption: {
          pollQuestionID: req.body.questionId,
          option: req.body.optionText,
        },
      };
      pollPostModel.addOption(data, (error, data) => {
        if (error) {
          response.status = false;
          response.message = error.message;
          response.error = error;
          res.status(400).send(response);
        } else {
          response.status = true;
          response.message = "Option added successfully.";
          res.status(200).send(response);
        }
      });
    } else {
      return res.status(401).send({
        status: false,
        message: "Unauthorized user !",
      });
    }
  };

  removeOptionFromPollPostsController = (req, res, next) => {
    if (req.token.role === "user") {
      let data = {
        pollId: req.body.pollId,
        optionId: req.body.optionId,
      };
      pollPostModel.removeOption(data, (error, data) => {
        if (error) {
          response.status = false;
          response.message = error.message;
          response.error = error;
          res.status(400).send(response);
        } else {
          response.status = true;
          response.message = "Option removed successfully.";
          res.status(200).send(response);
        }
      });
    } else {
      return res.status(401).send({
        status: false,
        message: "Unauthorized user !",
      });
    }
  };

  votePollPostController = (req, res, next) => {
    let data = {
      pollId: req.body.pollId,
      vote: req.body.vote,
      createdBy: req.token._id,
      modifiedBy: req.token._id,
    };
    pollPostModel.vote(data, (error, data) => {
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

  viewPollPostController = (req, res, next) => {
    // console.log(req.body);
    let data = {
      userId: req.token._id,
      pollId: req.body.pollId,
    };
    pollPostModel.view(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "Poll post viewed !";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };

  answerPollPostController = (req, res, next) => {
    let data = {
      userId: req.token._id,
      pollId: req.body.pollId,
      pollQuestionId: req.body.pollQuestionId,
      pollOptionId: req.body.pollOptionId,
    };
    // console.log(data);
    pollPostModel.pollAnswer(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "You have successfully answered the poll !";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };

  ReadAnswerPollPostController = (req, res, next) => {
    let data = {
      userId: req.token._id,
      // pollId: req.body.pollId,
      // pollQuestionId: req.body.pollQuestionId,
      // pollOptionId: req.body.pollOptionId,
    };
    // console.log(data);
    pollPostModel.readAnswers(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "You have retrieved answers !";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };

  commentPollPostController = (req, res, next) => {
    let data = {
      userId: req.token._id,
      pollId: req.body.pollId,
      text: req.body.text,
      createdBy: req.token._id,
      modifiedBy: req.token._id,
    };
    pollPostModel.pollComment(data, (error, data) => {
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

  readPollPostController = (req, res, next) => {
    let data = {
      pollId: req.params.pollId,
    };
    pollPostModel.readComments(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "Retrieved all comments !";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };

  pollPostReportController = (req, res, next) => {
    let data = {
      pollId: req.params.pollId,
    };
    pollPostModel.pollReport(data, (error, data) => {
      if (error) {
        response.status = false;
        response.message = error.message;
        response.error = error;
        res.status(400).send(response);
      } else {
        response.status = true;
        response.message = "Retrieved all comments !";
        response.data = data;
        res.status(200).send(response);
      }
    });
  };
}

module.exports = new PollPostController();
