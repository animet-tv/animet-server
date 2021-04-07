const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const bcrypt = require('bcrypt');
const saltRounds = Number(process.env.SALT_ROUNDS);
const UserList = require('./userprofile.model');
const { nanoid } = require('nanoid');

const UserSchema = mongoose.Schema({
    accountID: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true},
    avatarName: { type: String },
    googleId: { type: String },
    isGoogleUser: { type: Boolean, default: false },
    isProfilePublic: { type: Boolean, default: false }
});
UserSchema.plugin(beautifyUnique);

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.registerUser = (newUser) => {
    /* encrypte password, create new user & save */
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            throw err;
        }

        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
                throw err;
            }
            
            const user = new User({
                accountID: newUser.accountID,
                avatarName: newUser.avatarName,
                email: newUser.email,
                password: hash,
            });

            user.save( function (err) {
                if (err) {
                    console.log(err);
                }
            });

            /* create empty UserProfile for new user */
            UserList.createUserProfile(newUser.accountID, (err) => {
                if (err) throw err;
                
            });
            
        });

    });

};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
}

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.getUserByEmail = function (email, callback) {
    const query = { email: email };
    User.findOne(query, callback);
}

module.exports.getUserByAccountID = async (id, callback) => {
    try {
        User.findOne({ 'accountID': id }, {'googleId': 0,  'password': 0 ,'_id': 0,  '__v': 0 }, callback)
    } catch (error) {
        console.log(error);
    }
}

/* Social Sign Register */
module.exports.findOrCreate = (googleId, callback) => {
   /* return user if user already registerd  */
    User.countDocuments({ googleId: googleId }, (err, count) => {
        if (err) throw err;

        if (count > 0) {
            const query = { googleId: googleId }; 
            User.findOne(query, callback);
        } else {
            /* User does not exist so register it as new user */
            const accountID = nanoid();

            const user = new User({
                accountID: accountID,
                email: newUser.email,
                googleId: googleId,
                isGoogleUser: true
            });
         
            user.save( function (err) {
                if (err) {
                    console.log(err);
                }
            });
         
            /* create UserList since current user sign in with google */
              /* create empty userlist for new user */
              UserList.createUserList(accountID, (err) => {
                if (err) throw err;
            });
        }

   });

}

/* set list public status */
module.exports.setListStatus = async(request, callback) => {
    try {
        User.findOneAndUpdate(
            { 'accountID': request.accountID },
            { 'isProfilePublic': request.setListStatus }, 
            callback
        );
    } catch (error) {
        console.log(error);
    }
}
