const express = require('express');
const router = express.Router();
const Gapi = require('gogoanime');
const rateLimit = require("express-rate-limit");
const animeLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 1 minutes
    max: 200
});


router.get(
    '/get-anime-available', 
    animeLimiter,
    async(req, res) => {
    try {
        var result = [];
        var animeTitle = String(req.query.animeTitle);
        var dubTitle = animeTitle + ' ' + '(Dub)';
        /* remove special characters */
         //console.log(animeTitle);
         //animeTitle = animeTitle.replace(/[^a-zA-Z0-9 ]/g, '');
        
        var apiResult = await Gapi.search(animeTitle);
        for (let el = 0; el < apiResult.length; el++) {
           const title = apiResult[el].title;
           if (title && result.length < 2) {
                // find SUB 
                if (title === animeTitle) {
                    result.unshift(apiResult[el]);
                }

                // find DUB
                if (title === dubTitle) {
                    result.push(apiResult[el]);
                }
           }
            
        }

        res.json(result);
    } catch (error) {
        console.log(error);
    }
});

/* BACKUP: iframe player links */
router.get('/get-episode-stream', async(req, res) => {
    try {

        let streamEpisode = req.query.episodeID;
        let apiResult = await Gapi.animeEpisodeHandler(streamEpisode);
    
        res.json(apiResult);
    } catch (error) {
        console.log(error);
    }
});


module.exports = router;