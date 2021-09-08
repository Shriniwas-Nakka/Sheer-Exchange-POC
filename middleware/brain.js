const brain = require("brain.js");
// const data = require("../util/preTrainedData2.json");

const network = new brain.recurrent.LSTM();
// const network = new brain.recurrent.GRU();

// const trainingData = data.map((item) => ({
//   input: item.short_description,
//   output: item.category,
// }));
const data = require("../util/preTrainedData.json");

const trainingData = data.map((item) => ({
  input: item.text,
  output: item.category,
}));

const config = {
  iterations: 20,
  //   iterations: 5000,
  log: true,
  logPeriod: 5,
//   learningRate: 0.3,
};

network.train(trainingData, config);

getCategory = (hashtag) => {
  return network.run(hashtag);
};

module.exports = { getCategory };
