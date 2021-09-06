const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://Shriniwas:actionpop@cluster0.fduvb.mongodb.net/sheerexchange?retryWrites=true&w=majority",
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
