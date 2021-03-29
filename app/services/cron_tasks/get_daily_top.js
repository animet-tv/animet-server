require('dotenv').config();
const Top = require('../../models/top.model');
const { MongoClient } = require("mongodb");
const dbConfig = require('../../config/mongodb.config');
const Jikan = require('animet-jikan-wrapper');
const mal = new Jikan();


exports.populateDailyTop = async () => {
    try {
        var _TRENDING = [];
        var _ALL_TIME_POPULAR = [];
        var _UPCOMING = [];
        
        // TRENDING
        var res_trending = await mal.findTop('anime','0', 'airing');
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
        
        // ALL_TIME_POPULAR
        var res_popular = await mal.findTop('anime','0', 'bypopularity');
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

        // UPCOMING

        var res_upcoming = await mal.findTop('anime','0', 'upcoming');
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

        const newTopData = new Top({
            TRENDING: _TRENDING,
            ALL_TIME_POPULAR: _ALL_TIME_POPULAR,
            UPCOMING: _UPCOMING,
        });
        
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
