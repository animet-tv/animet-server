require('dotenv').config();
const Top = require('../../models/top.model');
const { MongoClient } = require("mongodb");
const dbConfig = require('../../config/mongodb.config');
const Jikan = require('animet-jikan-wrapper');
const { delay } = require('bluebird');
const mal = new Jikan();

// get top 500 of each type 
exports.populateDailyTop = async () => {
    try {
        var _TRENDING = [];
        var _ALL_TIME_POPULAR = [];
        var _UPCOMING = [];
        
        // TRENDING
        for (let i = 1; i < 6; i++) {
            var res_trending = await mal.findTop('anime',`${i}`, 'airing');
            res_trending.top.forEach(el => {
                let newResult = ({
                    mal_id: el.mal_id,
                    title: el.title,
                    img_url: el.image_url,
                    score: el.score,
                    episodes: el.episodes,
                });
                _TRENDING.push(newResult);
            });
            await delay(10000);
            console.log(`gathering dailys TRENDING page:${i}`);
        }

        
        // ALL_TIME_POPULAR
        for (let i = 1; i < 7; i++) { 
            var res_popular = await mal.findTop('anime',`${i}`, 'bypopularity');
            res_popular.top.forEach(el => {
                let newResult = ({
                    mal_id: el.mal_id,
                    title: el.title,
                    img_url: el.image_url,
                    score: el.score,
                    episodes: el.episodes,
                });
                _ALL_TIME_POPULAR.push(newResult);
            });
            await delay(10000);
            console.log(`gathering dailys ALL TIME POPULAR page:${i}`);

        }

        // UPCOMING
        for (let i = 1; i < 6; i++) { 
            var res_upcoming = await mal.findTop('anime',`${i}`, 'upcoming');
            res_upcoming.top.forEach(el => {
                let newResult = ({
                    mal_id: el.mal_id,
                    title: el.title,
                    img_url: el.image_url,
                    score: el.score,
                    episodes: el.episodes,
                });
                _UPCOMING.push(newResult);
            });
            await delay(10000);
            console.log(`gathering dailys UPCOMING page:${i}`);
        }

        const newTopData = new Top({
            TRENDING: _TRENDING,
            ALL_TIME_POPULAR: _ALL_TIME_POPULAR,
            UPCOMING: _UPCOMING,
        });
        
        cleanDailyTop();
        
        newTopData.save();

        console.log('Updated Daily Top', ' ' , new Date());
    } catch (error) {
        console.log(error);
    }
}

module.exports.cleanDailyTop = () => {
    Top.deleteMany({} , (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
  
      console.log('All Tops cleared');
    });
}
