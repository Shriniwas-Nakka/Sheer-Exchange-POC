const mongoose = require("mongoose");

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (error, data) => {
    if (error) {
      console.log("Failed to established connection !", error);
    } else {
      console.log("Connection established successfully !");
    }
  }
);

module.exports = mongoose;
