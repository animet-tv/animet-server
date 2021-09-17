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
    title_offline: { type: String },
    title: { type: String },
    id: { type: String },
    episodes:{ type: Number },
    img_url: { type: String },
    airing_start: { type: Number, default: 0},
    synonyms: [String]
},{ _id : false });


const AnimettvIndexSchema = mongoose.Schema({
    animettv: [Anime],
});
AnimettvIndexSchema.plugin(beautifyUnique);

const AnimettvIndex = module.exports = mongoose.model('AnimettvIndex', AnimettvIndexSchema);

module.exports.getAnimettvIndex = async (callback) => {
    try {
        AnimettvIndex.find({},{_id: 0})
        .then(
            _result => {
                callback(null, _result);
            }
        )

        /* redis.get('AnimettvIndex', (err, result) => {
            if (result) {
                const resultJSON = JSON.parse(result);
                callback(null, resultJSON);
            } else {
                AnimettvIndex.find({},{_id: 0})
                    .then(
                        _result => {
                            redis.setex('AnimettvIndex', 50400, JSON.stringify(_result));
                            callback(null, _result);
                        }
                    )
            }
        }) */
        
    } catch (error) {
        console.log(error);
        callback(null, false);
    }
}
