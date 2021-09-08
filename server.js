const express = require("express");
const cors = require("cors");
const app = express();
const routes = require("./routes/routes");
require("dotenv").config();

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use("/", routes);

app.listen(port, () => {
  console.log(`Server started at ${port}`);
  require("./dbConfig/db.config");
});
