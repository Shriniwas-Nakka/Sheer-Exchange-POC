// const { getCategory } = require("../middleware/brain");
// const { getCategory } = require("../middleware/limdu");

class Hashtag {
  createHashTag = (req, res, next) => {};

  getHashTagCategory = async (req, res, next) => {
    let str = req.query.hashtag;
    console.log(str);
    // let category = getCategory(str); // brain.js
    // let category = getCategory(str); // brain.js
    // return res.send(category);
  };
}

module.exports = new Hashtag();
