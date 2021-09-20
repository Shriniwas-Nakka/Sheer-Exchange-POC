const route = require("express").Router();
const pollPostController = require("../controller/pollPostController");
const userController = require("../controller/userController");
const authentication = require("../middleware/middleware");
const hashtagController = require("../controller/hashtagController");
const tagController = require("../controller/tagController");
const notificationController = require("../controller/notificationController");
const savePostController = require("../controller/savePostController");

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

/**
 * Tag
 */
route.post(
  "/tag",
  authentication.authenticateUser,
  tagController.createTagController
);
route.get(
  "/tags",
  authentication.authenticateUser,
  tagController.readTagsController
);

/**
 * Trending posts
 */

route.get(
  "/trendingPosts",
  authentication.authenticateUser,
  tagController.trendingPostsController
);

/**
 * Notifications
 */

route.get(
  "/notifications",
  authentication.authenticateUser,
  notificationController.readNotificationsController
);
route.put(
  "/view/:notificationId",
  authentication.authenticateUser,
  notificationController.viewNotificationController
);

/**
 * Poll post save
 */
route.post(
  "/savepost",
  authentication.authenticateUser,
  savePostController.savePostController
);
route.delete(
  "/unsavepost",
  authentication.authenticateUser,
  savePostController.unsavePostController
);
module.exports = route;
