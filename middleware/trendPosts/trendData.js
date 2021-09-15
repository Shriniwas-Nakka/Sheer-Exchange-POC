module.exports = (posts) => {
  // console.log("-------------", posts);
  try {
    const valuesPerTenMin = {
      minLikes: 0,
      maxLikes: 0,
      minViews: 0,
      maxViews: 0,
      minComments: 0,
      maxComments: 0,
      minVotes: 0,
      maxVotes: 0,
    };
    const trendingPosts = [];
    for (let [index, post] of posts.entries()) {
      // console.log(post.views);
      const avgLikes = getAvgValuePerTenMinute(post.likes, post.createdAt);
      const avgViews = getAvgValuePerTenMinute(post.views, post.createdAt);
      const avgComments = getAvgValuePerTenMinute(
        post.comments,
        post.createdAt
      );
      const avgVotes = getAvgValuePerTenMinute(
        post.totalNumberOfVotes,
        post.createdAt
      );
      // console.log("-->", avgLikes, avgViews, avgComments, avgVotes);
      trendingPosts.push({
        avgLikes,
        avgViews,
        avgComments,
        avgVotes,
        ...post._doc,
      });
      if (index === 0) {
        // set avg values of 1st iteration video as min and max values
        valuesPerTenMin.minLikes = avgLikes;
        valuesPerTenMin.minViews = avgViews;
        valuesPerTenMin.minComments = avgComments;
        valuesPerTenMin.minVotes = avgVotes;
        // max
        valuesPerTenMin.maxLikes = avgLikes;
        valuesPerTenMin.maxViews = avgViews;
        valuesPerTenMin.maxComments = avgComments;
        valuesPerTenMin.maxVotes = avgVotes;
      } else {
        // compare avg values with min values
        if (avgLikes < valuesPerTenMin.minLikes) {
          valuesPerTenMin.minLikes = avgLikes;
        }
        if (avgViews < valuesPerTenMin.minViews) {
          valuesPerTenMin.minViews = avgViews;
        }
        if (avgComments < valuesPerTenMin.minComments) {
          valuesPerTenMin.minComments = avgComments;
        }
        if (avgVotes < valuesPerTenMin.minVotes) {
          valuesPerTenMin.minVotes = avgVotes;
        }

        // compare avg values with max values
        if (avgLikes > valuesPerTenMin.maxLikes) {
          valuesPerTenMin.maxLikes = avgLikes;
        }
        if (avgViews > valuesPerTenMin.maxViews) {
          valuesPerTenMin.maxViews = avgViews;
        }
        if (avgComments > valuesPerTenMin.maxComments) {
          valuesPerTenMin.maxComments = avgComments;
        }
        if (avgVotes > valuesPerTenMin.maxVotes) {
          valuesPerTenMin.maxVotes = avgVotes;
        }
      }
    }
    return {
      trendingPosts,
      valuesPerTenMin,
    };
  } catch (error) {
    throw error;
  }
};

function getAvgValuePerTenMinute(count, uploadTime) {
  // console.log(count);
  // console.log(count / (6 * getPostDuration(uploadTime)));
  // console.log(getPostDuration(uploadTime));
  // console.log(count === 0 ? 0 : count / (6 * getPostDuration(uploadTime)));
  return count === 0
    ? 0
    : getPostDuration(uploadTime) === 0
    ? count
    : count / (6 * getPostDuration(uploadTime));
}

function getPostDuration(time) {
  // console.log(time);
  const currentTime = new Date();
  const diff =
    (currentTime.getTime() - new Date(time).getTime()) / 1000 / (60 * 60);
  // console.log(Math.abs(Math.round(diff)));
  return Math.abs(Math.round(diff));
}
