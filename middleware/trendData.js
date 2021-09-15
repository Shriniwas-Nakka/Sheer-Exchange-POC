module.exports = (posts) => {
  try {
    const valuesPerTenMin = {
      minMentions: 0,
      maxMentions: 0,
    };
    // console.log(posts.entries());
    const trendingPosts = [];
    for (let [index, post] of posts.entries()) {
      //   console.log(post);
      const avgMentionsPerTenMin = getAvgValuePerTenMinute(
        post.mentions,
        post.createdAt
      );
      trendingPosts.push({
        avgMentionsPerTenMin,
        ...post._doc,
      });
      if (index === 0) {
        // set avg values of 1st iteration video as min and max values
        valuesPerTenMin.minMentions = avgMentionsPerTenMin;
        // max
        valuesPerTenMin.maxMentions = avgMentionsPerTenMin;
      } else {
        // compare avg values with min values
        if (avgMentionsPerTenMin < valuesPerTenMin.minMentions) {
          valuesPerTenMin.minMentions = avgMentionsPerTenMin;
        }
        // compare avg values with max values
        if (avgMentionsPerTenMin > valuesPerTenMin.maxMentions) {
          valuesPerTenMin.maxMentions = avgMentionsPerTenMin;
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
  //   console.log(count / (6 * getVideoDuration(uploadTime)));
  return count / (6 * getPostDuration(uploadTime));
}

function getPostDuration(time) {
  const currentTime = new Date();
  const diff =
    (currentTime.getTime() - new Date(time).getTime()) / 1000 / (60 * 60);
  console.log(currentTime.getTime(), new Date(time).getTime());
  //   console.log(((currentTime.getTime() - new Date(time).getTime()) / (1000 * 60 * 60)) % 24);
  //   console.log(Math.abs(Math.round(diff)));
  return Math.abs(Math.round(diff));
}
