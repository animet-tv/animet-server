const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

if (process.env.REDISTOGO_URL) {
    // TODO: redistogo connection
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    var redis = require("redis").createClient(rtg.port, rtg.hostname);
    redis.auth(rtg.auth.split(":")[1]);
} else {
    var redis = require("redis").createClient();
}

const Anime = mongoose.Schema({
    title: {type: String},
    img: {type: String},
    synopsis: {type: String},
  
},{ _id : false });

const SpotlightSchema = mongoose.Schema({
    spotlight: [Anime],
});
SpotlightSchema.plugin(beautifyUnique);

const Spotlight = module.exports = mongoose.model('Spotlight', SpotlightSchema);

module.exports.getSpotlight = async (callback) => {
    try {
        redis.get('spotlight', (err, result) => {
                if (result) {
                    const resultJSON = JSON.parse(result);
                    callback(null, resultJSON);
                } else {
                    Spotlight.find({},{_id: 0})
                        .then(
                            _result => {
                                redis.setex('spotlight', 50400, JSON.stringify(_result));
                                callback(null, _result);
                            }
                        )
                }
            })
    } catch (error) {
        console.log(error);
        callback(null, false);
    }
}
