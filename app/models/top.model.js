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


module.exports.getTrending = async () => {
    try {
        return Top.find({},{'TRENDING': 1});
    } catch (error) {
        console.log(error);
    }
}

module.exports.getPopular = async () => {
    try {
        return Top.find({},{'ALL_TIME_POPULAR': 1});
    } catch (error) {
        console.log(error);
    }
}

module.exports.getUpcoming = async () => {
    try {
        return Top.find({},{'UPCOMING': 1});
    } catch (error) {
        console.log(error);
    }
}
