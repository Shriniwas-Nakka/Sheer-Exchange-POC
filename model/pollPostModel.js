const mongoose = require("mongoose");

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
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "pollvotes" }],
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

class PollPostModel {
  create = async (obj, callback) => {
    const session = await postModel.startSession();
    session.startTransaction();
    try {
      const options = { session };
      const post = await postModel.create([obj.post], options);

      obj.question.pollId = await post[0]._id;
      const pollQuestion = await questionModel.create([obj.question], options);

      obj.options.pollQuestionID = await pollQuestion[0]._id;

      //   console.log(obj.options);
      let option = {};
      const pollOptions = await obj.options.option.map(async (element) => {
        option.pollQuestionID = await pollQuestion[0]._id;
        option.option = await element;
        // console.log(option);
        return await optionModel.create([option], options);
      });
      console.log(pollOptions);

      Promise.all(pollOptions).then(async (result) => {
        await session.commitTransaction();
        session.endSession();
        console.log("result", result);
        callback(null, result);
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      callback(error);
    }
  };

  read = async (obj, callback) => {
    // let all = await postModel.aggregate([
    //   {
    //     $lookup: {
    //       from: "pollvotes",
    //       localField: "votes",
    //       foreignField: "_id",
    //       as: "productObjects",
    //     },
    //   },
    // ]);
    // console.log(all);

    // Retrieve Posts
    let posts = await postModel
      .find()
      .populate("createdBy", "firstName lastName email profileUrl")
      .sort({ createdAt: -1 });

    let postIds = posts.map((post) => {
      return post._id;
    });

    // let pollVotes = await voteModel.find({ pollId: { $in: postIds } });
    let pollVotes = await voteModel
      .find({ createdBy: obj.userId })
      .select("pollId vote");

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
    let allposts = await posts.map((post) => {
      // console.log({ ...post });
      return {
        ...post._doc,
        question: questionWithOptions.filter(
          (question) => post._id.toString() === question.pollId.toString()
        )[0],
      };
    });

    let newAll = await allposts.map((post) => {
      return {
        ...post,
        voters: pollVotes.filter(
          (vote) => vote.pollId.toString() === post._id.toString()
        ),
      };
    });

    callback(null, newAll);
  };

  getTotalNumberOfVotes = async (obj) => {
    return await answerModel.find(obj).count();
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
        console.log(vote[0].createdBy);
        await postModel
          .findByIdAndUpdate(obj.pollId, {
            $push: { votes: vote[0].createdBy },
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
          await callback(null, "You have already voted !");
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
}

module.exports = new PollPostModel();
