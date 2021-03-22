const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const PostSchema = mongoose.Schema({
  postID: { type: String, index: true, unique: true },
  title: { type: String },
  synopsis: { type: String },
  genre: [{
     type: String
  }],
  aired: { type: String },
  episodes: { type: String },
  img_url: { type: String },

  ranked: { type: Number },
  score: { type: Number },
  rating: {
    rating_count: { type: Number },
    average_rating: { type: Number },
    each_rating: [{
      given_rating: { type: Number },
      date_submitted: { type: Date, Default: Date.now },
    }],
  },
  nsfw: { type: Boolean, Default: false }
});
PostSchema.plugin(uniqueValidator);

const Post = module.exports = mongoose.model('Post', PostSchema);



module.exports.getFeed = async (request) => {
  /*
    !For now serve by rank  until we start collection user rating data and build custom ranking
  */

  try {
    const nsfw = request.nsfw;
    const limit = request.limit;

    return await Post.find({ 'nsfw': nsfw },{'_id': 0, 'postID': 1, 'title': 1, 'img_url': 1, 'score': 1, 'genre': 1, 'synopsis': 1}).sort({ 'score': -1}).limit(limit).skip(Math.floor(Math.random() * Math.floor(100)));
  } catch (error) {
    console.error(error);
  }
}

module.exports.getRandomFeed = async (request) => {
  try {
    const nsfw = request.nsfw;

    return await Post.find ({ 'nsfw': nsfw }, {'_id': 0, 'postID': 1, 'title': 1, 'img_url': 1, 'score': 1, 'genre': 1, 'synopsis': 1}).limit(200).skip(Math.floor(Math.random() * Math.floor(13000)));
  } catch (error) {
    console.error(error);
  }
}


module.exports.appendRating =  async (request, callback) => {
  /*
  * * Every rating per post other rating fileds must be update
   */
  try {
    const postId = request.postID;
    const givenRating = request.rating;
     // append new rating to post
     await Post.updateOne({ 'postID': postId },
     {
          $push: {
            'rating.each_rating': {
              'given_rating': givenRating
            }
          },
        $inc: { 'rating.rating_count': 1 }
     });

   } catch (error) {
    console.error(error);
   }
}

