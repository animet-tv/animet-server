const redis = require("redis");
const client = redis.createClient();
const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');


const Anime = mongoose.Schema({
    img_url: { type: String },
    title: { type: String }
},{ _id : false });


const GenreSchema = mongoose.Schema({
    Action : [Anime],
    Adventure : [Anime],
    Cars : [Anime],
    Comedy : [Anime],
    Dementia : [Anime],
    Demons : [Anime],
    Drama : [Anime],
    Dub : [Anime],
    Ecchi : [Anime],
    Fantasy : [Anime],
    Game : [Anime],
    Harem : [Anime],
    Historical : [Anime],
    Horror : [Anime],
    Josei : [Anime],
    Kids : [Anime],
    Magic : [Anime],
    Martial_Arts : [Anime],
    Mecha : [Anime],
    Military : [Anime],
    Music : [Anime],
    Mystery : [Anime],
    Parody : [Anime],
    Police : [Anime],
    Psychological : [Anime],
    Romance : [Anime],
    Samurai : [Anime],
    School : [Anime],
    Sci_Fi : [Anime],
    Seinen : [Anime],
    Shoujo : [Anime],
    Shoujo_Ai : [Anime],
    Shounen : [Anime],
    Shounen_Ai : [Anime],
    Slice_of_Life : [Anime],
    Space : [Anime],
    Sports : [Anime],
    Super_Power : [Anime],
    Supernatural : [Anime],
    Thriller : [Anime],
    Vampire : [Anime],
    Yaoi: [Anime],
    Yuri: [Anime]
});
GenreSchema.plugin(beautifyUnique);

const Genre = module.exports = mongoose.model('Genre', GenreSchema);

module.exports.getAnimeGenres = async (callback) => {
    try {
        client.get('GENRES', (err, result) => {
                if (result) {
                    const resultJSON = JSON.parse(result);
                    callback(null, resultJSON);
                } else {
                    Genre.find({},{_id: 0})
                        .then(
                            _result => {
                                client.setex('GENRES', 3600, JSON.stringify(_result));
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

