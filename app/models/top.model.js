const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
/* if (process.env.REDISTOGO_URL) {
    // TODO: redistogo connection
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    var redis = require("redis").createClient(rtg.port, rtg.hostname);
    redis.auth(rtg.auth.split(":")[1]);
} else {
    var redis = require("redis").createClient();
} */

if (process.env.REDIS_URL) {
    const redis = require("redis");
    const fs = require("fs");

    const client = redis.createClient(process.env.REDIS_URL, {
        tls: {
            rejectUnauthorized: false
        }
    });

} else {
    var client = require("redis").createClient();
}

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
                                client.setex('TRENDING', 10800, JSON.stringify(_result));
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
                                client.setex('ALL_TIME_POPULAR', 10800, JSON.stringify(_result));
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
                                client.setex('UPCOMING', 10800, JSON.stringify(_result));
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