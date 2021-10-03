const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

if (process.env.REDISTOGO_URL) {
    // TODO: redistogo connection
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    var client = require("redis").createClient(rtg.port, rtg.hostname);
    client.auth(rtg.auth.split(":")[1]);
} else {
    var client = require("redis").createClient();
}


const Anime = mongoose.Schema({
    title: { type: String },
    img_url: { type: String }
},{ _id : false });


const MovieSchema = mongoose.Schema({
    Movies: [Anime]
});
MovieSchema.plugin(beautifyUnique);

const Movie = module.exports = mongoose.model('Movie', MovieSchema);

module.exports.getMovies = async (callback) => {
    try {
        client.get('Movie', (err, result) => {
                if (result && result['Movies'] !== undefined) {
                    const resultJSON = JSON.parse(result);
                    callback(null, resultJSON);
                } else {
                    Movie.find({},{_id: 0})
                        .then(
                            _result => {
                                client.setex('Movie', 50400, JSON.stringify(_result));
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
