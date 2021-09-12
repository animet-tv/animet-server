require('dotenv').config()
const express = require('express');
const router = express.Router();
const Gapi = require('animet-gogoanime');
const rateLimit = require("express-rate-limit");
var rp = require('request-promise');
const anime60fps_demon_slayer = require('../../anime60/demonslayer_60fps.json');
const shingeki_no_kyojin_the_final_season = require('../../anime60/shingeki_no_kyojin_the_final_season_60fps.json');
const violet_evergarden_60fps_dub = require('../../anime60/violet_evergarden_60fps_dub.json');
const available_titles_60fps = require('../../anime60/available-titles.json');
const weathering_with_you = require('../../anime60/weathering_with_you.json');

const animeLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 200
});

const anime60fps = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100
});


const streamApiURL = process.env.LOCAL_ANIMET_STREAM_API_URL;
router.get(
    '/get-anime-available', 
    animeLimiter,
    async(req, res) => {
    try {
        var result = [];
        var animeTitle = String(req.query.animeTitle);
        var dubTitle = animeTitle + ' ' + '(Dub)';
        
        
        var options = {
            'method': 'GET',
            'url': `${streamApiURL}api/search/?word=${animeTitle}&page=1`,
            'headers': {
            }
        };
        rp(options, function (error, response) {
            if (error) throw new Error(error);
            
            var apiResult = JSON.parse(response.body).results;

            for (let el = 0; el < apiResult.length; el++) {
                if(result.length > 2) {
                    break;
                }
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
            
            console.log(result);
            res.json(result);

        });



    } catch (error) {
        console.log(error);
    }
});

/* BACKUP: iframe player links */
router.get('/gapi/get-episode-stream', async(req, res) => {
    try {
        console.log(req.query.episodeID);
        let links = [];
        let streamEpisode = req.query.episodeID;
        let apiResult = await Gapi.animeEpisodeHandler(streamEpisode);
        console.timeEnd('animeEpisodeHandler');
        let link = {
            size: 'High Speed',
            src: `https://${apiResult[0].servers[0].iframe}`
        }
        links.push(link);

        res.json({links: links});
    } catch (error) {
        console.log(error);
    }
});

router.get(
    '/anime60fps-available-titles',
    anime60fps,
    async(req, res) => {
        try {
            res.json(available_titles_60fps);
        } catch (error) {
            console.log(error);
            res.sendStatus(404);
        }
    }
)
router.get(
    '/anime60fps',
     anime60fps,
     async(req, res) => {
         try {
             res.header("Content-Type", "application/json");
             
             let title = req.query.title;

             if (title === 'Demon Slayer') {
                 res.json(anime60fps_demon_slayer);
             } else if (title === 'Weathering with You') {
                res.json(weathering_with_you);
            }else if (title === 'Shingeki no Kyojin: The Final Season') {
                 res.json(shingeki_no_kyojin_the_final_season);
             } else if (title === 'Demon Slayer Mugen Train') {
                 let tmp = {
                     anime60fps: [
                         {
                             src: 'https://bacchus.fra1.digitaloceanspaces.com/demon_slayer_mugen_train/playlist.m3u8',
                             episode_number: 1
                         }
                     ]
                 };
                 res.json(tmp);
             } else if (title === 'Violet Evergarden') {
                 res.json(violet_evergarden_60fps_dub);
             } 
         } catch (error) {
             console.log(error);
         }
     })


module.exports = router;