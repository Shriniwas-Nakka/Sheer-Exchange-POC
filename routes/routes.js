const route = require("express").Router();
const pollPostController = require("../controller/pollPostController");
const userController = require("../controller/userController");
const authentication = require("../middleware/middleware");
const hashtagController = require("../controller/hashtagController");

route.post(
  "/pollpost",
  authentication.authenticateUser,
  pollPostController.createPollPostController
);
route.get(
  "/pollposts",
  authentication.authenticateUser,
  pollPostController.readPollPostsController
);
route.put(
  "/pollpost",
  authentication.authenticateUser,
  pollPostController.updatePollPostsController
);
route.post(
  "/pollpost/addOption",
  authentication.authenticateUser,
  pollPostController.addOptionToPollPostsController
);
route.delete(
  "/pollpost/removeOption",
  authentication.authenticateUser,
  pollPostController.removeOptionFromPollPostsController
);
route.put(
  "/pollpost/vote",
  authentication.authenticateUser,
  pollPostController.votePollPostController
);
route.put(
  "/pollpost/view",
  authentication.authenticateUser,
  pollPostController.viewPollPostController
);
route.post(
  "/pollpost/answer",
  authentication.authenticateUser,
  pollPostController.answerPollPostController
);
route.get(
  "/pollpost/answers",
  authentication.authenticateUser,
  pollPostController.ReadAnswerPollPostController
);
route.post(
  "/pollpost/comment",
  authentication.authenticateUser,
  pollPostController.commentPollPostController
);
route.get(
  "/pollpost/comments/:pollId",
  authentication.authenticateUser,
  pollPostController.readPollPostController
);
route.get(
  "/pollpost/:pollId/report",
  authentication.authenticateUser,
  pollPostController.pollPostReportController
);

/**
 * User
 * */
route.post("/user/signUp", userController.signUpUserController);
route.post("/user/signIn", userController.signInUserController);

/**
 * Hashtag
 * */
route.post("/hashtag", hashtagController.createHashTag);
route.get("/category", hashtagController.getHashTagCategory);

module.exports = route;
