const redis = require("redis");
const client = redis.createClient(process.env.REDISCLOUD_URL);
const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');


const Anime = mongoose.Schema({
    mal_id: { type: Number },
    img_url: { type: String },
    score: { type: Number },
    title: { type: String },
    episodes: { type: Number }
},{ _id : false });


const TopSchema = mongoose.Schema({
    TRENDING: [Anime],
    ALL_TIME_POPULAR: [Anime],
    UPCOMING: [Anime],
   
});
TopSchema.plugin(beautifyUnique);

const Top = module.exports = mongoose.model('Top', TopSchema);


module.exports.getTrending = async (callback) => {
    try {
        client.get('TRENDING', (err, result) => {
                if (result) {
                    const resultJSON = JSON.parse(result);
                    callback(null, resultJSON);
                } else {
                    Top.find({},{'TRENDING': 1})
                        .then(
                            _result => {
                                client.setex('TRENDING', 3600, JSON.stringify(_result));
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

module.exports.getPopular = async (callback) => {
    try {
        client.get('ALL_TIME_POPULAR', (err, result) => {
                if (result) {
                    const resultJSON = JSON.parse(result);
                    callback(null, resultJSON);
                } else {
                    Top.find({},{'ALL_TIME_POPULAR': 1})
                        .then(
                            _result => {
                                client.setex('ALL_TIME_POPULAR', 3600, JSON.stringify(_result));
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

module.exports.getUpcoming = async (callback) => {
    try {
        client.get('UPCOMING', (err, result) => {
                if (result) {
                    const resultJSON = JSON.parse(result);
                    callback(null, resultJSON);
                } else {
                    Top.find({},{'UPCOMING': 1})
                        .then(
                            _result => {
                                client.setex('UPCOMING', 3600, JSON.stringify(_result));
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
