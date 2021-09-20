const mongoose = require("mongoose");
const { followModel } = require("./followModel.js");
const { taggedUserModel } = require("./taggedUser");
const { tagModel } = require("./tagsModel");
const { savePostModel } = require("./savePostModel");
const {
  createNotification,
  deleteNotification,
} = require("./notificationModel");
const trendCalculator = require("../middleware/trendPosts/trendData");
const normalizedPosts = require("../middleware/trendPosts/normalizeValues");
const { post } = require("../routes/routes.js");

const pollPostSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, default: 86400000 },
    isActive: { type: Boolean, default: true },
    location: { type: String, required: true },
    // pollQuestionId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "pollquestions",
    //   index: true,
    // },
    // pollOptionId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "polloptions",
    //   index: true,
    // },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    totalNumberOfVotes: { type: Number, default: 0 },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "pollvotes" }], // need to think on this
    taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "tags" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

const pollQuestionSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pollposts",
      required: true,
      index: true,
    },
    question: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const pollOptionSchema = new mongoose.Schema(
  {
    pollQuestionID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pollquestions",
      required: true,
      index: true,
    },
    option: { type: String, required: true },
    percentage: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const pollAnswerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pollposts",
      required: true,
      index: true,
    },
    pollQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pollquestions",
      required: true,
      index: true,
    },
    pollOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "polloptions",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const pollVoteSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pollposts",
      required: true,
      index: true,
    },
    vote: { type: Boolean, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

const pollCommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pollposts",
      required: true,
      index: true,
    },
    text: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

const postModel = mongoose.model("pollposts", pollPostSchema);
const questionModel = mongoose.model("pollquestions", pollQuestionSchema);
const optionModel = mongoose.model("polloptions", pollOptionSchema);
const answerModel = mongoose.model("pollanswers", pollAnswerSchema);
const voteModel = mongoose.model("pollvotes", pollVoteSchema);
const commentModel = mongoose.model("pollcomments", pollCommentSchema);

// postModel.watch().on("change", (change) => {
//   console.log("watch--->", change);
// });

answerModel.watch().on("change", async (change) => {
  console.log("----> change in answer model", change);
  if (change.operationType === "insert") {
    let post = await postModel.findOne({ _id: change.fullDocument.pollId });
    let data = {
      pollId: change.fullDocument.pollId,
      to: post.createdBy,
      from: change.fullDocument.userId,
      notificationType: "VOTE",
      createdBy: change.fullDocument.userId,
      modifiedBy: change.fullDocument.userId,
    };
    data.to.toString() !== data.from.toString() &&
      createNotification(data, (error, data) => {
        if (error) {
          throw new Error(error);
        } else {
          console.log("notification created !", data);
        }
      });
  }
});

voteModel.watch().on("change", async (change) => {
  // console.log("vote --->", change);
  if (change.operationType === "insert") {
    if (change.fullDocument.vote) {
      let post = await postModel.findOne({ _id: change.fullDocument.pollId });
      let data = {
        pollId: change.fullDocument.pollId,
        to: post.createdBy,
        from: change.fullDocument.createdBy,
        notificationType: "LIKE",
        createdBy: change.fullDocument.createdBy,
        modifiedBy: change.fullDocument.createdBy,
      };
      console.log(data);
      console.log(data.to.toString() !== data.from.toString());
      data.to.toString() !== data.from.toString() &&
        createNotification(data, (error, data) => {
          if (error) {
            throw new Error(error);
          } else {
            console.log("notification created !", data);
          }
        });
    }
  }
  // if (change.operationType === "delete") {
  //   console.log(change);
  //   deleteNotification({ id: change.documentKey._id }, (error, data) => {
  //     if (error) {
  //       throw new Error(error);
  //     } else {
  //       console.log("notification deleted !", data);
  //     }
  //   });
  // }
});

commentModel.watch().on("change", async (change) => {
  if (change.operationType === "insert") {
    let post = await postModel.findOne({ _id: change.fullDocument.pollId });
    let data = {
      pollId: change.fullDocument.pollId,
      to: post.createdBy,
      from: change.fullDocument.createdBy,
      notificationType: "COMMENT",
      createdBy: change.fullDocument.createdBy,
      modifiedBy: change.fullDocument.createdBy,
    };
    console.log(data);
    data.to.toString() !== data.from.toString() &&
      createNotification(data, (error, data) => {
        if (error) {
          throw new Error(error);
        } else {
          console.log("notification created !", data);
        }
      });
  }
});

class PollPostModel {
  create = async (obj, callback) => {
    const session = await postModel.startSession();
    session.startTransaction();
    try {
      const options = { session };
      const post = await postModel.create([obj.post], options);
      let pollId = post[0]._id;
      // console.log(pollId);

      (await obj.post.taggedUsers.length) > 0 &&
        (await obj.post.taggedUsers.map(async (user) => {
          let data = {
            pollId: pollId,
            userId: obj.post.createdBy,
            taggedUserId: user,
            createdBy: obj.post.createdBy,
            modifiedBy: obj.post.createdBy,
          };
          await taggedUserModel.create([data], options);
        }));

      (await obj.post.tags.length) > 0 &&
        obj.post.tags.map(async (tag) => {
          await tagModel
            .findByIdAndUpdate(tag, { $inc: { mentions: 1 } })
            .session(session);
        });

      obj.question.pollId = await post[0]._id;
      const pollQuestion = await questionModel.create([obj.question], options);

      obj.options.pollQuestionID = await pollQuestion[0]._id;

      let option = {};
      const pollOptions = await obj.options.option.map(async (element) => {
        option.pollQuestionID = await pollQuestion[0]._id;
        option.option = await element;
        return await optionModel.create([option], options);
      });

      Promise.all(pollOptions).then(async (result) => {
        await session.commitTransaction();
        session.endSession();
        callback(null, result);
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      callback(error);
    }
  };

  read = async (obj, callback) => {
    let taggedPosts =
      obj.key === "TAGGED" &&
      (await taggedUserModel.aggregate([
        {
          $match: { taggedUserId: new mongoose.Types.ObjectId(obj.userId) },
        },
        {
          $lookup: {
            from: "pollposts",
            localField: "pollId",
            foreignField: "_id",
            as: "posts",
          },
        },
        { $unwind: "$posts" },
        {
          $lookup: {
            from: "users",
            localField: "posts.taggedUsers",
            foreignField: "_id",
            as: "posts.tagUsers",
          },
        },
        {
          $lookup: {
            from: "tags",
            localField: "posts.tags",
            foreignField: "_id",
            as: "posts.selectedTags",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "posts.createdBy",
            foreignField: "_id",
            as: "posts.user",
          },
        },
        { $unwind: "$posts.user" },
        {
          $lookup: {
            from: "pollvotes",
            // localField: "votes",
            // foreignField: "_id",
            let: { id: "$id" },
            pipeline: [
              {
                $match: { createdBy: new mongoose.Types.ObjectId(obj.userId) },
              },
            ],
            as: "posts.polllikes",
          },
        },
        {
          $project: {
            "posts.taggedUsers": 0,
            "posts.tags": 0,
            "user.password": 0,
            "user.createdAt": 0,
            "user.updatedAt": 0,
            "user.__v": 0,
            createdAt: 0,
            updatedAt: 0,
            __v: 0,
          },
        },
        { $sort: { createdAt: -1 } },
        // { $addFields: "$posts" },
      ]));
    let newTaggedPosts =
      obj.key === "TAGGED" && taggedPosts.map((post) => post.posts);

    let query =
      (obj.key === "ALL" && {
        $or: [
          {
            createdBy: {
              $in: (
                await followModel
                  .find({ follower: obj.userId })
                  .select("following")
              ).map((id) => new mongoose.Types.ObjectId(id.following)),
            },
          },
          // fetch tagged user post as well
          // {
          //   createdBy: {
          //     $in: (await taggedUserModel.find({ taggedUserId: obj.userId }))
          //       .map((id) => {
          //         console.log(id.userId);
          //         return new mongoose.Types.ObjectId(id.userId);
          //       }),
          //   },
          // },
          { createdBy: new mongoose.Types.ObjectId(obj.userId) },
        ],
      }) ||
      (obj.key === "SELF" && {
        createdBy: new mongoose.Types.ObjectId(obj.userId),
      }) ||
      (obj.key === "COUNTRY" && {
        location: obj.value,
      });

    let posts =
      obj.key !== "TAGGED" &&
      (await postModel.aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "users",
            localField: "taggedUsers",
            foreignField: "_id",
            as: "tagUsers",
          },
        },
        {
          $lookup: {
            from: "tags",
            localField: "tags",
            foreignField: "_id",
            as: "selectedTags",
          },
        },
        {
          $lookup: {
            from: "pollvotes",
            // localField: "votes",
            // foreignField: "_id",
            let: { id: "$id" },
            pipeline: [
              {
                $match: { createdBy: new mongoose.Types.ObjectId(obj.userId) },
              },
            ],
            as: "polllikes",
          },
        },
        // { $unwind: "$polllikes" },
        {
          $project: {
            taggedUsers: 0,
            tags: 0,
            "user.password": 0,
            "user.createdAt": 0,
            "user.updatedAt": 0,
            "user.__v": 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ]));

    /**
     * Saved poll post
     */
    // let savedPosts = await savePostModel.find({ userId: obj.userId });
    // // console.log("saved", savedPosts);

    // savedPosts =
    //   obj.key !== "TAGGED" &&
    //   (await posts.map(async (post) => {
    //     return {
    //       ...post,
    //       saved: await savedPosts.some(
    //         (savedPost) =>
    //           savedPost.pollId.toString() === post._id.toString() &&
    //           obj.userId.toString() === savedPost.userId.toString()
    //       ),
    //     };
    //   }));
    // console.log(savedPosts);

    // console.log("---->", posts);

    /**Logic to get user followed posts */

    // let query =
    //   (obj.key === "ALL" && {}) ||
    //   (obj.key === "SELF" && { createdBy: obj.userId });
    // console.log(query);

    // // Retrieve Posts
    // let posts = await postModel
    //   .find(query)
    //   .populate("createdBy", "firstName lastName email profileUrl")
    //   .sort({ createdAt: -1 });

    let postIds =
      obj.key === "TAGGED"
        ? newTaggedPosts.map((post) => {
            return post._id;
          })
        : posts.map((post) => {
            return post._id;
          });

    // let pollVotes = await voteModel.find({ pollId: { $in: postIds } });
    // let pollVotes = await voteModel
    //   .find({ createdBy: obj.userId })
    //   .select("pollId vote");

    // Retrieve Post questions
    let postQuestions = await questionModel
      .find({ pollId: { $in: postIds } })
      .select("pollId question");
    let questionIds = postQuestions.map((question) => {
      return question._id;
    });

    // Retrieve question options
    let options = await optionModel
      .find({
        pollQuestionID: { $in: questionIds },
      })
      .select("pollQuestionID option percentage");

    // Merge question with thier options
    let questionWithOptions = await postQuestions.map((question) => {
      //   console.log({ ...question });
      return {
        ...question._doc,
        options: options.filter(
          (option) =>
            question._id.toString() === option.pollQuestionID._id.toString()
        ),
      };
    });

    // Merge poll posts with thier questions
    let allposts =
      obj.key === "TAGGED"
        ? await newTaggedPosts.map((post) => {
            return {
              ...post,
              question: questionWithOptions.filter(
                (question) => post._id.toString() === question.pollId.toString()
              )[0],
            };
          })
        : await posts.map((post) => {
            return {
              ...post,
              question: questionWithOptions.filter(
                (question) => post._id.toString() === question.pollId.toString()
              )[0],
            };
          });

    // let newAll = await allposts.map((post) => {
    //   return {
    //     ...post,
    //     voters: pollVotes.filter(
    //       (vote) => vote.pollId.toString() === post._id.toString()
    //     ),
    //   };
    // });
    // console.log(newAll);
    // callback(null, newAll);
    callback(null, allposts);
  };

  update = async (obj, callback) => {
    const session = await postModel.startSession();
    session.startTransaction();

    const postResult = await postModel.findById(obj.pollId);
    let count =
      postResult.likes +
      postResult.dislikes +
      postResult.comments +
      postResult.totalNumberOfVotes;
    if (count === 0) {
      try {
        const postResult = await postModel
          .findByIdAndUpdate(obj.pollId, obj.post, { new: true })
          .session(session);
        if (postResult == null) {
          await session.endSession();
          callback({ message: "poll does not exists !" });
        }
        const questionResult = await questionModel
          .findByIdAndUpdate(obj.questionId, obj.question, { new: true })
          .session(session);
        if (questionResult == null) {
          await session.endSession();
          callback({ message: "question does not exists !" });
        }
        await session.commitTransaction();
        session.endSession();
        callback(null, "post updated !");
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        callback(error);
      }
    } else {
      callback({ message: "You can not update post now !" });
    }
  };

  addOption = async (obj, callback) => {
    const postResult = await postModel.findById(obj.pollId);
    let count = postResult.likes + postResult.dislikes + postResult.comments;
    if (count === 0) {
      optionModel.create(obj.newOption, (error, data) => {
        if (error) {
          callback(error);
        } else {
          callback(null, data);
        }
      });
    } else {
      callback({ message: "You can not update post now !" });
    }
  };

  removeOption = async (obj, callback) => {
    const postResult = await postModel.findById(obj.pollId);
    let count = postResult.likes + postResult.dislikes + postResult.comments;
    if (count === 0) {
      optionModel.findByIdAndDelete(obj.optionId, (error, data) => {
        if (error) {
          callback(error);
        } else if (data === null) {
          callback("Option does not exists !");
        } else {
          callback(null, data);
        }
      });
    } else {
      callback({ message: "You can not update post now !" });
    }
  };

  vote = async (obj, callback) => {
    const session = await postModel.startSession();
    session.startTransaction();
    try {
      const options = { session };
      const post = await voteModel
        .findOne({
          $and: [{ createdBy: obj.createdBy }, { pollId: obj.pollId }],
        })
        .session(session);
      if (post === null) {
        let vote = await voteModel.create([obj], options);
        let increament = (await obj.vote)
          ? { $inc: { likes: 1 } }
          : { $inc: { dislikes: 1 } };
        // console.log(vote[0]._id);
        await postModel
          .findByIdAndUpdate(obj.pollId, {
            $push: { votes: vote[0]._id },
          })
          .session(session);
        await postModel
          .findByIdAndUpdate(obj.pollId, increament)
          .session(session);
        await callback(null, "You have successfully voted !");
      } else {
        if (post.vote !== obj.vote) {
          let decrement = (await obj.vote)
            ? { $inc: { likes: 1, dislikes: -1 } }
            : { $inc: { likes: -1, dislikes: 1 } };

          await voteModel
            .findOneAndUpdate(
              { $and: [{ createdBy: obj.createdBy }, { pollId: obj.pollId }] },
              { vote: obj.vote },
              { new: true }
            )
            .session(session);
          await postModel
            .findByIdAndUpdate(obj.pollId, decrement)
            .session(session);
          await callback(null, "You have successfully voted !");
        } else {
          let decrement = (await obj.vote)
            ? { $inc: { likes: -1 } }
            : { $inc: { dislikes: -1 } };

          await voteModel
            .findOneAndRemove({ pollId: obj.pollId })
            .session(session);

          await postModel
            .findByIdAndUpdate(obj.pollId, decrement)
            .session(session);
          // console.log(obj);
          await postModel
            .findByIdAndUpdate(
              obj.pollId,
              {
                $pull: {
                  votes: new mongoose.Types.ObjectId(post._id),
                },
              },
              { new: true }
            )
            .session(session);
          await callback(null, "You have removed your vote !");
        }
      }
      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      callback(error);
    }
  };

  view = (obj, callback) => {
    postModel.findByIdAndUpdate(
      obj.pollId,
      { $inc: { views: 1 } },
      (error, data) => {
        if (error) {
          callback(error);
        } else {
          callback(null, data);
        }
      }
    );
  };

  pollAnswer = async (obj, callback) => {
    const session = await postModel.startSession();
    session.startTransaction();
    try {
      const options = { session };
      let findPost = await answerModel
        .findOne({
          $and: [
            { userId: obj.userId },
            { pollId: obj.pollId },
            { pollQuestionId: obj.pollQuestionId },
          ],
        })
        .session(session);
      if (findPost === null) {
        await answerModel.create([obj], options);
        let incrementVote = await postModel
          .findByIdAndUpdate(
            obj.pollId,
            {
              $inc: { totalNumberOfVotes: 1 },
            },
            { new: true }
          )
          .session(session);
        let pollOptions = await optionModel
          .find({ pollQuestionID: obj.pollQuestionId })
          .select("_id")
          .session(session);
        let vote = await pollOptions.map(async (element) => {
          let totalAnswered = await answerModel
            .find({
              pollOptionId: element._id,
            })
            .session(session)
            .count();

          return await optionModel
            .findByIdAndUpdate(
              element._id,
              {
                percentage:
                  (totalAnswered / incrementVote.totalNumberOfVotes) * 100,
              },
              { new: true }
            )
            .session(session);
        });
        Promise.all(vote)
          .then(async (result) => {
            console.log(vote);
            await session.commitTransaction();
            session.endSession();
            callback(null, result);
          })
          .catch(async (error) => {
            await session.abortTransaction();
            session.endSession();
            callback(error);
          });
      } else {
        await session.abortTransaction();
        session.endSession();
        console.log(data);
        console.log("already answered !");
        callback(null, data);
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      callback(error);
    }
  };

  readAnswers = (obj, callback) => {
    answerModel
      .find({ userId: obj.userId }, (error, data) => {
        if (error) {
          callback(error);
        } else {
          callback(null, data);
        }
      })
      .populate("userId");
  };

  pollComment = async (obj, callback) => {
    const session = await commentModel.startSession();
    session.startTransaction();
    try {
      const options = { session };
      await commentModel.create([obj], options);
      await postModel.findByIdAndUpdate(obj.pollId, { $inc: { comments: 1 } });
      let see = await session.commitTransaction();
      if (see) {
        callback(null, "Comment is saved !");
      } else {
        callback("Something went wrong !");
      }
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      callback(error);
    }
  };

  readComments = async (obj, callback) => {
    commentModel
      .find({ pollId: obj.pollId }, (err, data) => {
        if (err) {
          callback(err);
        } else {
          callback(null, data);
        }
      })
      .populate("userId");
    /**Need to add user model to populate */
  };

  pollReport = async (obj, callback) => {
    const session = await commentModel.startSession();
    session.startTransaction();
    try {
      const options = { session };
      let question = await questionModel
        .findOne({ pollId: obj.pollId })
        .populate("pollId")
        .session(session);
      let questionOptions = await optionModel
        .find({ pollQuestionID: question._id })
        .select("pollQuestionID option percentage")
        .session(session);
      let totalAnswered = await answerModel
        .find({
          pollOptionId: { $in: questionOptions },
        })
        .session(session)
        .populate("pollOptionId")
        .populate("userId");
      let numberOfUsers = totalAnswered.filter(
        (element) => element.userId.role === "user"
      ).length;
      let numberOfGuests = totalAnswered.filter(
        (element) => element.userId.role === "guest"
      ).length;

      await session.commitTransaction();
      session.endSession();
      callback(null, {
        totalVotes: question.pollId.totalNumberOfVotes,
        totalNumberOfUsersVoted: numberOfUsers,
        totalNumberOfGuestssVoted: numberOfGuests,
        data: questionOptions,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      callback(error);
    }
  };

  trendingPosts = async (obj, callback) => {
    let query = obj.location ? { location: obj.location } : {};

    let data = await postModel.find(query).sort("-createdAt");
    let { trendingPosts, valuesPerTenMin } = await trendCalculator(data);
    // console.log(trendingPosts);
    let newData = await normalizedPosts(trendingPosts, valuesPerTenMin);
    newData.forEach(async (ele) => {
      ele.trendingValue =
        (ele.normalizedLikes +
          ele.normalizedViews +
          ele.normalizedComments +
          ele.normalizedVotes) *
        100;
      delete ele.normalizedLikes;
      delete ele.normalizedViews;
      delete ele.normalizedComments;
      delete ele.normalizedVotes;
      delete ele.avgLikes;
      delete ele.avgViews;
      delete ele.avgComments;
      delete ele.avgVotes;
    });
    callback(
      null,
      newData.sort((a, b) => b.trendingValue - a.trendingValue)
    );
  };
}

module.exports = new PollPostModel();
