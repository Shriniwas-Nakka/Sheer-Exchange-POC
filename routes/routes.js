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
route.get("/users", userController.getUsersBySearchController);
route.get(
  "/:userId/profile",
  authentication.authenticateUser,
  userController.getUserProfileController
);

/**
 * User Follower Model
 * */
/** Note:
 * action : [follow, unfollow]
 * userId : [following user id]
 */
route.post(
  "/:action/:userId",
  authentication.authenticateUser,
  userController.followUserController
);
/** Note:
 * filter : [followers, following]
 */
route.get(
  "/:userId/:filter/list",
  authentication.authenticateUser,
  userController.listFollowerAndFollowingController
);

/**
 * Hashtag
 * */
route.post("/hashtag", hashtagController.createHashTag);
route.get("/category", hashtagController.getHashTagCategory);

module.exports = route;
