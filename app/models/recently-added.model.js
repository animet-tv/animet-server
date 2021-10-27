const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
require('dotenv').config();

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
   
    //redistogo connection
    /* var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    var client = require("redis").createClient(rtg.port, rtg.hostname);
    client.auth(rtg.auth.split(":")[1]); */
} else {
    var client = require("redis").createClient();
}


const RecentlyAddedEntity = mongoose.Schema({
    title: { type: String },
    id: { type: String },
    episodeNumber: { type: Number },
    img_url: { type: String } 
},{ _id : false });

const RecentlyAddedSchema = mongoose.Schema({
    SUB: [RecentlyAddedEntity],
    DUB: [RecentlyAddedEntity]
});
RecentlyAddedSchema.plugin(beautifyUnique);

const RecentlyAdded = module.exports = mongoose.model('RecentlyAdded', RecentlyAddedSchema);

/* module.exports.getRecentlyAdded = async (callback) => {
    try {
        RecentlyAdded.find({},{_id: 0})
                        .then(
                            _result => {
                                
                                callback(null, _result);
                            }
                        )
    } catch (error) {
        console.log(error);
        callback(null, false);
    }
} */


module.exports.getRecentlyAdded = async (callback) => {
    try {
        client.get('RecentlyAdded', (err, result) => { 
            // check if redis have any data store if not fetch from DB
            if ((result !== undefined) && (result !== null)) {
                    const resultJSON = JSON.parse(result);
                    callback(null, resultJSON);
                } else {
                    RecentlyAdded.find({},{_id: 0})
                        .then(
                            _result => {
                                client.setex('RecentlyAdded', 14400, JSON.stringify(_result));
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
