require('dotenv').config();
const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const { nanoid } = require('nanoid');


const AnimetListItemSchema = mongoose.Schema({
        item_id: { type: String },
        mal_id: { type: Number },
        postID: { type: Number },
        img_url: { type: String },
        title: { type: String },
        nsfw: { type: Boolean },
        dateCreated: { type: Number, default: Date.now() },
}, { _id : false });

const TrackedListItemSchema = mongoose.Schema({
    mal_id: { type: Number, unique: true, },
}, { _id : false });

const ContinueWatching = mongoose.Schema({
    mal_id: { type: Number, unique: true, },
    anime: { type: AnimetListItemSchema },
    episode_id: { type: String },
    timestamp: { type: Number },
    currentEpisode: { type: Number },
    totalEpisode: { type: Number },
    dateCreated: { type: Number, default: Date.now() }
}, { _id: false});

const RatingHistory = mongoose.Schema({
    postID: { type: String  },
    givenRating: { type: Number  },
    nsfw: { type: Boolean, default: false },
    dateCreated: { type: Number, default: Date.now() },
})
const UserProfileSchema = mongoose.Schema({
    accountID: { type: String, required: true },

    ratingHistory: [RatingHistory],
    tracked_anime: [TrackedListItemSchema],
    plan_to_watch: [AnimetListItemSchema],
    completed: [AnimetListItemSchema],
    tracked_anime_continue_watching: [TrackedListItemSchema],
    continue_watching: [ ContinueWatching ]
    
});
UserProfileSchema.plugin(beautifyUnique);

const UserProfile = module.exports = mongoose.model('UserProfile', UserProfileSchema);

module.exports.createUserProfile =  async (newUserID) => {
    try {
        /* default lists for every new user */
        const newUserProfile = new UserProfile({
            accountID: newUserID,
        });

        newUserProfile.save( function (err) {
            if (err) {
                console.log(err);
            }
        });
        
    } catch (error) {
        console.log(error);
    }
};


module.exports.getUserProfileById = function (id, callback) {
    const query = { 'accountID': id };
    UserProfile.findOne(query, callback);
}

module.exports.getMyProfile = async (id, callback) => {
    try { 
        await UserProfile.findOne({ 'accountID': id }, {'accountID': 0, 'ratingHistory': 0, 'tracked_anime': 0,  '_id': 0, '__v': 0 },callback)
    } catch (error) {
        console.log(err);
    }
}

module.exports.appendRating = async (ratingRequest) => {
    try {
        
            const accountID = ratingRequest.accountID;
            const postID = ratingRequest.postID;
            const rating = ratingRequest.rating;
            const nsfw = ratingRequest.nsfw;

            UserProfile.updateOne({ 'accountID': accountID },
            {
                $addToSet: {
                    'ratingHistory': {
                        'postID': postID,
                        'givenRating': rating,
                        'nsfw': nsfw,
                }},
            });

    } catch (error) {
        console.log(error);
    }
}


module.exports.appendItemToList= async (addItemRequest, callback) => {
    try {
        const _accountID = addItemRequest.accountID;
        const _mal_id = addItemRequest.mal_id;
        const _img_url = addItemRequest.img_url;
        const _title = addItemRequest.title;
        const _nsfw = addItemRequest.nsfw;
        const _LIST = addItemRequest.LIST;

        /* add to tracked anime */
        const trackedItemReq = {
            accountID: _accountID,
            mal_id: _mal_id
        }
        
                UserProfile.appendTrackedItem(trackedItemReq, (err, doc) => {
                    if (err) {
                        throw err;
                    } 
                });

                if (_LIST == 'plan_to_watch') {
                    UserProfile.updateOne({ 'accountID': _accountID, },
                    {
                        $addToSet: {
                            'plan_to_watch':
                                {   
                                    'item_id': nanoid(),
                                    'mal_id': _mal_id,
                                    'img_url': _img_url,
                                    'title': _title,
                                    'nsfw': _nsfw,
                                }
                        }
                    }, callback);
                    
                } else if (_LIST == 'completed') {
                    UserProfile.updateOne({ 'accountID': _accountID, },
                    {
                        $addToSet: {
                            'completed':
                                {   
                                    'item_id': nanoid(),
                                    'mal_id': _mal_id,
                                    'img_url': _img_url,
                                    'title': _title,
                                    'nsfw': _nsfw,
                                }
                        }
                    }, callback);
                }        

    } catch (error) {
        console.log(error);
    }
}


module.exports.removeItemFromList = async (removeItemRequest, callback) => {
    try {
        const _accountID = removeItemRequest.accountID;
        const _item_id = removeItemRequest.item_id;
        const _mal_id = removeItemRequest.mal_id;
        const _LIST = removeItemRequest.LIST;
        
        if (_LIST == 'plan_to_watch') { 
            UserProfile.updateOne({ 'accountID': _accountID }, { $pull: { 'plan_to_watch': { 'item_id': _item_id } } },callback)

        } else if (_LIST == 'completed') { 
            UserProfile.updateOne({ 'accountID': _accountID }, { $pull: { 'completed': { 'item_id': _item_id } } },callback)

        }

    } catch (error) {
        console.log(error);
    }
}

module.exports.appendTrackedItem= async (addItemRequest, callback) => {
    try {
        
        const _accountID = addItemRequest.accountID;
        const _mal_id = addItemRequest.mal_id;

        UserProfile.updateOne({ 'accountID': _accountID }, {
            $addToSet: {
                'tracked_anime': { 'mal_id': _mal_id}
            }
        }, callback);

    } catch (error) {
        console.log(error);
    }
}

module.exports.removeTrackedItem = async (removeItemRequest, callback) => {
    try {
        const _accountID = removeItemRequest.accountID;
        const _mal_id = removeItemRequest.mal_id;

        UserProfile.updateOne({ 'accountID': _accountID }, {
            $pull: {
                'tracked_anime': { 'mal_id': _mal_id}
            }
        }, callback);


    } catch (error) {
        console.log(error);
    }
}

module.exports.appendTracked_anime_continue_watching= async (addItemRequest, callback) => {
    try {
        
        const _accountID = addItemRequest.accountID;
        const _mal_id = addItemRequest.mal_id;

        UserProfile.updateOne({ 'accountID': _accountID }, {
            $addToSet: {
                'tracked_anime_continue_watching': { 'mal_id': _mal_id}
            }
        }, callback);

    } catch (error) {
        console.log(error);
    }
}

module.exports.removeTracked_anime_continue_watching = async (removeItemRequest, callback) => {
    try {
        const _accountID = removeItemRequest.accountID;
        const _mal_id = removeItemRequest.mal_id;

        UserProfile.updateOne({ 'accountID': _accountID }, {
            $pull: {
                'tracked_anime_continue_watching': { 'mal_id': _mal_id}
            }
        }, callback);


    } catch (error) {
        console.log(error);
    }
}


module.exports.addItemToContinueWatching = async (addItemRequest, callback) => {
    try {
        const _accountID = addItemRequest.accountID;
        const _mal_id = addItemRequest.mal_id;
        const _img_url = addItemRequest.img_url;
        const _title = addItemRequest.title;
        const _nsfw = addItemRequest.nsfw;

        const AnimetListItemSchema  = ({
            'item_id': nanoid(),
            'mal_id': _mal_id,
            'img_url': _img_url,
            'title': _title,
            'nsfw': _nsfw,
        });

        const _episode_id =addItemRequest.episode_id;
        const _timestamp = addItemRequest.timestamp;
        const _currentEpisode = addItemRequest.currentEpisode;
        const _totalEpisode = addItemRequest.totalEpisode;

        const trackedItemReq = {
            accountID: _accountID,
            mal_id: _mal_id
        }
        
        UserProfile.appendTracked_anime_continue_watching(trackedItemReq, (err, doc) => {
            if (err) {
                throw err;
            } 
        });


        UserProfile.updateOne({ 'accountID': _accountID }, 
                    {
                        $addToSet: {
                            'continue_watching': {
                                 'mal_id': _mal_id,
                                 'anime': AnimetListItemSchema,
                                 'episode_id': _episode_id,
                                 'timestamp': _timestamp,
                                 'currentEpisode': _currentEpisode,
                                 'totalEpisode': _totalEpisode,
                            }
                        }
                    }, callback);            
        
    } catch (error) {
        console.log(error);
    }
}


module.exports.removeItemFromContinueWatching = async (removeItemRequest, callback) => {
    try {
        const _accountID = removeItemRequest.accountID;
        const _mal_id = removeItemRequest.mal_id;
        
        UserProfile.updateOne({ 'accountID': _accountID}, { 
            $pull: { 'continue_watching': { 'mal_id': _mal_id } }
        }, callback)

    } catch (error) {
        console.log(error);
    }
}

module.exports.getContinueWatching = async (accoundID, callback) => {
    try {
        UserProfile.findOne({ 'accountID': accoundID},{'continue_watching': 1, '_id': 0}, callback);
    } catch (error) {
        console.log(error);
    }
}