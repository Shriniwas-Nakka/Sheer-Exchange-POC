var limdu = require("limdu");

// First, define our base classifier type (a multi-label classifier based on svm.js):
var TextClassifier = limdu.classifiers.multilabel.BinaryRelevance.bind(0, {
  binaryClassifierType: limdu.classifiers.SvmJs.bind(0, { C: 1.0 }),
});

// Initialize a classifier with a feature extractor and a lookup table:
var intentClassifier = new limdu.classifiers.EnhancedClassifier({
  classifierType: TextClassifier,
  featureExtractor: limdu.features.NGramsOfWords(1), // each word ("1-gram") is a feature
  featureLookupTable: new limdu.features.FeatureLookupTable(),
});

const data = require("../util/preTrainedData.json");

const trainingData = data.map((item) => ({
  input: item.text,
  output: item.category,
}));

// Train and test:
intentClassifier.trainBatch(trainingData);

// console.dir(intentClassifier.classify("I want an apple and a banana")); // ['apl','bnn']

getCategory = (hashtag) => {
  return intentClassifier.classify(hashtag);
};

module.exports = { getCategory };
