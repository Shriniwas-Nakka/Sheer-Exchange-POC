module.exports = (posts, valuesPerTenMin) => {
  try {
    const avgLikesDiff = valuesPerTenMin.maxLikes - valuesPerTenMin.minLikes;
    const avgViewsDiff = valuesPerTenMin.maxViews - valuesPerTenMin.minViews;
    const avgCommentsDiff =
      valuesPerTenMin.maxComments - valuesPerTenMin.minComments;
    const avgVotesDiff = valuesPerTenMin.maxVotes - valuesPerTenMin.minVotes;
    // console.log(valuesPerTenMin);

    // console.log(avgLikesDiff, avgViewsDiff, avgCommentsDiff, avgVotesDiff);

    posts.forEach((post) => {
      post.normalizedLikes =
        avgLikesDiff !== 0
          ? (post.avgLikes - valuesPerTenMin.minLikes) / avgLikesDiff
          : 0;
      post.normalizedViews =
        avgViewsDiff !== 0
          ? (post.avgViews - valuesPerTenMin.minViews) / avgViewsDiff
          : 0;

      post.normalizedComments =
        avgCommentsDiff !== 0
          ? (post.avgComments - valuesPerTenMin.minComments) / avgCommentsDiff
          : 0;

      post.normalizedVotes =
        avgVotesDiff !== 0
          ? (post.avgVotes - valuesPerTenMin.minVotes) / avgVotesDiff
          : 0;
    });
    return posts;
  } catch (error) {
    throw error;
  }
};
