const mongoose = require("mongoose");
/* if (process.env.REDISTOGO_URL) {
    // TODO: redistogo connection
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    var client = require("redis").createClient(rtg.port, rtg.hostname);
    client.auth(rtg.auth.split(":")[1]);
} else {
    var client = require("redis").createClient();
} */

if (process.env.REDISCLOUD_URL) {
  // rediscloud connection
  var redis = require('redis');
  var client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});

} else {
  var client = require("redis").createClient();
}

const MetricaStatsSchema = mongoose.Schema({
  totalSessionToday: { type: Number },
});

const MetricaStats = (module.exports = mongoose.model(
  "MetricaStats",
  MetricaStatsSchema
));

module.exports.getTotalSessionToday = async (callback) => {
  try {
    client.get("TotalSessionToday", (err, result) => {
      if (result) {
        const resultJSON = JSON.parse(result);
        callback(null, resultJSON);
      } else {
        MetricaStats.find({}, {totalSessionToday: 1, _id: 0 }).then((_result) => {
          client.setex("TotalSessionToday", 60, JSON.stringify(_result));
          callback(null, _result);
        });
      }
    });
  } catch (error) {
    console.log(error);
    callback(null, false);
  }
};

