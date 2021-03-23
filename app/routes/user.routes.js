const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user.model');
const UserProfile = require('../models/userprofile.model');
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

router.post(
    '/register', 
    body('avatarName').isLength({ min: 3 }).isString(),
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    (req,res) => {
       
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
            }

            /* before registering user check if email and avatar does not exist */
            User.countDocuments({ email: req.body.email }, (err, count) => {
                if (err) {
                    res.sendStatus(500);
                    throw(err);
                }

                if (count > 0) {
                    res.json({success: false, message: 'user by that email or avatar name already exist try different one'});
                } else {

                    /* check if avatar name not taken */

                    User.exists({'avatarName': req.body.avatarName}, (err, isExist) => {
                        if (err) {
                            res.json({ success: false, message: 'something went wrong please try again'});
                            throw err;
                        }

                        if (isExist) {
                           res.json({ success: false, message: `${req.body.avatarName} is already taken`});
                        } else {
                            
                            const accountId = nanoid();
                            const newUser = {
                                accountID: accountId,
                                email: req.body.email,
                                password: req.body.password,
                                avatarName: req.body.avatarName,
                            };
        
                            User.registerUser(newUser, (err, callback) => {
                                if (err) {
                                    res.sendStatus(500);
                                    throw err;
                                } 
                                        
                            });
                            
                            console.log('befoer creating profile ');
                            /* create empty UserProfile for new user */
                            UserProfile.createUserProfile(accountId, (err) => {
                                if (err) throw err;
                            });
                            
                            /* user successfully created */
                            res.json({
                                success: true,
                                msg: `account email: ${newUser.email} successfully created`
                            });
                        }
                    });
                }
            })

        } catch (error) {
            console.log(error);
        }
});

router.post(
    '/login',
    body('email').isEmail(),
    body('password').isLength({ min: 3 }),
    (req, res) => {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
            }

            User.countDocuments({ email: req.body.email }, (err, count) => {
                if (err) {
                    res.sendStatus(500);
                    throw err;
                }


               if (count < 1) {
                   res.sendStatus(400);
               } else {
                   User.getUserByEmail(req.body.email, (err, user) => {
                        if (err) {
                            res.sendStatus(500);
                            throw err;
                        }

                        User.comparePassword(req.body.password, user.password, (err, isMatch) => {
                            if (err) throw err;

                            if (isMatch) {
                                const token = jwt.sign(user.toJSON(), process.env.PASSPORT_SECRET, {
                                    // WILL EXPIRE IN 24 hrs
                                    expiresIn: '2d'
                                });

                                // user auth correct 
                                res.json({
                                    success: true,
                                    token: 'JWT ' + token,
                                    user: {
                                        accountID: user.accountID      
                                    }
                                });
                            } else {
                                res.sendStatus(400);
                            }
                        });
                   });
               }
            });

        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
});

router.get(
    '/profile',
    passport.authenticate(['regular-login'], { session: false }),  
    async (req, res) => {
        try {
            const accountID = req.user.accountID;
            User.getUserByAccountID(accountID, (err, accountProfile) => {
                if (err) {
                    res.json({ success: false, message: 'error while finding profile data'});
                    throw err;
                }

                res.json({ success: true, accountProfile});
            });
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
)
router.get(
    '/list', 
    passport.authenticate(['regular-login'], { session: false }),  
    async (req, res) => {
        try {
            const accountID = req.user.accountID;
            UserProfile.getMyProfile(accountID, (err,result) => {
                if (err) {
                    res.sendStatus(500);
                    throw err;
                }

                res.json(result);
            });
            
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
});


router.put(
    '/add-item-to-list',
    passport.authenticate(['regular-login'], { session: false }),
    async (req, res) => {
        try {

            const addItemRequest = {
                accountID: req.user.accountID,
                mal_id: req.body.mal_id,
                img_url: req.body.img_url,
                title: req.body.title,
                nsfw: req.body.nsfw,
                LIST: req.body.LIST,
            }

        
            UserProfile.exists({ 'tracked_anime': { 'mal_id': addItemRequest.mal_id } }, (err, exists) => {
                if (err) {
                    throw err;
                }

                if (exists == false) {   /* does not exists */
                    UserProfile.appendItemToList(addItemRequest, (err,callback) => {
                        if (err) {
                            res.json({ success: false, message: 'error while adding new item to list' });
                            throw err;
                        }
                     
                        res.json({ success: true, message: 'Anime has been added to list'});
                        
                    });
                    
                } else {
                    res.json({ success: false, message: 'Anime already in list'}); 
                }
            });
            

        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
)

router.put(
    '/remove-item-from-list',
    passport.authenticate(['regular-login'], { session: false }),
    async (req, res) => {
        try {
            const removeItemRequest = {
                accountID: req.user.accountID,
                item_id: req.body.item_id,
                LIST: req.body.LIST,
            }

            console.log(req.body);
            const trackedItemReq = {
                accountID: removeItemRequest.accountID,
                mal_id: req.body.mal_id,
            }
            
            UserProfile.removeTrackedItem(trackedItemReq, (err, doc) => {
                if (err) {
                    throw err;
                } 
            });

            UserProfile.removeItemFromList(removeItemRequest, (err, callback) => {
                if (err) {
                    res.json({ success: false, message: 'error while removing item from list' });
                    throw err;
                }
                res.json({ success: true, message: 'Anime removed from list'});     
    
            });
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
);

router.put(
    '/item-completed',
    passport.authenticate(['regular-login'], { session: false }),
    async (req, res) => {
        try {
            
            const addItemRequest = {
                accountID: req.user.accountID,
                mal_id: req.body.mal_id,
                img_url: req.body.img_url,
                title: req.body.title,
                nsfw: req.body.nsfw,
                LIST: 'completed',
            }

            UserProfile.appendItemToList(addItemRequest, (err,callback) => {
                if (err) {
                    res.json({ success: false, message: 'error while adding new item to list' });
                    throw err;
                }

                const removeItemRequest = {
                    accountID: req.user.accountID,
                    item_id: req.body.item_id,
                    LIST: 'plan_to_watch',
                }
    
                UserProfile.removeItemFromList(removeItemRequest, (err, callback) => {
                    if (err) {
                        res.json({ success: false, message: 'error while removing item from list' });
                        throw err;
                    }
                });

                res.json({ success: true, message: 'Anime moved to plan to watch'});     

            });

        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
);

router.put(
    '/item-plan-to-watch',
    passport.authenticate(['regular-login'], { session: false }),
    async (req, res) => {
        try {
            
            const addItemRequest = {
                accountID: req.user.accountID,
                mal_id: req.body.mal_id,
                img_url: req.body.img_url,
                title: req.body.title,
                nsfw: req.body.nsfw,
                LIST: 'plan_to_watch',
            }

            UserProfile.appendItemToList(addItemRequest, (err,callback) => {
                if (err) {
                    res.json({ success: false, message: 'error while adding new item to list' });
                    throw err;
                }

                const removeItemRequest = {
                    accountID: req.user.accountID,
                    item_id: req.body.item_id,
                    mal_id: req.body.mal_id,
                    LIST: 'completed',
                }
    
                UserProfile.removeItemFromList(removeItemRequest, (err, callback) => {
                    if (err) {
                        res.json({ success: false, message: 'error while removing item from list' });
                        throw err;
                    }
                });

                res.json({ success: true, message: 'item moved to completed'});     

            });

        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
);

router.put(
    '/set-list-status',
    passport.authenticate(['regular-login'], { session: false }),
    async (req,res) => {
        try {
            const setListStatusRequest = {
                accountID: req.user.accountID,
                setListStatus: req.body.isListPublic,
            }

            console.log(setListStatusRequest);
            User.setListStatus(setListStatusRequest, (err, callback) => {
                if (err) {
                    req.json({success: false, message: 'error while changing list status'});
                    throw err;
                }
                let status = 'private';
                if (req.body.isListPublic) {
                    status = 'public';
                }

                res.json({ success: true, message: `you lists are now ${status}`});
            });

        } catch (error) {
            res.sendStatus(500);
            console.log(error);
        }
    }
);

router.get(
    '/get-public-user-list',
    async (req, res) => { 
        try {
            const accountID = req.params.accountID;
            console.log(req);
            /* check if user list public if it is return user list */
            User.findOne({ 'accountID': accountID }, {'isProfilePublic': 1}, (err, doc) => {
                if (err) {
                    res.json({success: false, message: 'error while getting user list'});
                    throw err;
                }

                console.log(doc);
                if (doc.isListPublic) {
                    UserProfile.getMyProfile(accountID, (err, list) => {
                        if (err) {
                            res.json({success: false, message: 'error while getting user list'});
                            throw err;
                        }

                        res.json(list);
                    })
                } else {
                    res.json({ success: false, message: 'List is private'})
                }
            });
            
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
);

module.exports = router;