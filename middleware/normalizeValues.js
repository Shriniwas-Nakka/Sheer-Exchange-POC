module.exports = (posts, valuesPerTenMin) => {
  try {
    // console.log(posts, valuesPerTenMin);
    const avgMentionDiff =
      valuesPerTenMin.maxMentions - valuesPerTenMin.minMentions;
    // console.log(avgMentionDiff);
    posts.forEach((post) => {
      post.normalizedMentions =
        avgMentionDiff !== 0
          ? (post.avgMentionsPerTenMin - valuesPerTenMin.minMentions) /
            avgMentionDiff
          : 0;
    });
    return posts;
  } catch (error) {
    throw error;
  }
};
