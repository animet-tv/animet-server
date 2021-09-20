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
    title: { type: String },
    id: { type: String }
},{ _id : false });


const PreparedTitleSchema = mongoose.Schema({
    gogoanime: [Anime],
});
PreparedTitleSchema.plugin(beautifyUnique);

const PreparedTitle = module.exports = mongoose.model('PreparedTitle', PreparedTitleSchema);

module.exports.getPreparedTitle = async (callback) => {
    try {
        client.get('PreparedTitle', (err, result) => {
                if (result) {
                    const resultJSON = JSON.parse(result);
                    callback(null, resultJSON);
                } else {
                    PreparedTitle.find({},{_id: 0})
                        .then(
                            _result => {
                                client.setex('PreparedTitle', 50400, JSON.stringify(_result));
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
