const express = require('express');
const router = express.Router();
const { getCurrentSeason } = require('../services/cron_tasks/add_new_anime_season');
const SeasonAnime = require('../models/season.model');
const Jikan = require('jikan-node');
const mal = new Jikan();

const TRENDING_AMOUNT = 10;

router.get('/get-current-top-season', async (req, res) => {
    try {
        const getSeason = d => Math.floor((d.getMonth() / 12 * 4)) % 4;
        const season = ['Winter', 'Spring', 'Summer', 'Autumn'][getSeason(new Date())];
        const year = new Date().getFullYear();

        const result = await SeasonAnime.getTopSeason({ season: season, year: year })
        res.json(result);
    } catch (error) {
        console.log(error);
    }
});

router.get('/get-season-by-id', async (req, res) => {
    try {
        const result = await SeasonAnime.getSeasonById(req.query.id);
        if (result) {
            res.json(result);
        } else {
            res.json({success: false, message: `Sorry We could't find it`});
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/get-seasons-data', async (req, res) => {
    try {
        const AVAILABLE_SEASONS = await SeasonAnime.getSeasonsDetail();
        res.json(AVAILABLE_SEASONS);
    } catch (error) {
        console.log(error);
    }
});

router.get('/search', async (req, res) => {
    try {
        const term = req.query.term;
        /* 
        mal_id: number
        title: string;
        img_url: string;
        score: number;
        episodes: number;
        */
        const RESULT = [];
        const param = {
            limit: 10,
            order_by: 'title'
        }
       
        const response = await mal.search('anime',term, param);

        response.results.forEach(el => {
            let newResult = ({
                mal_id: el.mal_id,
                title: el.title,
                img_url: el.image_url,
                score: el.score,
                episodes: el.episodes,
            });
            
            RESULT.push(newResult);
        });

        res.json(RESULT);
    } catch (error) {
        console.log(error);
    }
});

router.get(
    '/trending',
    async (req, res) => {
        try {
            TOP_RESULT = [];
            var counter = 0;
            const response = await mal.findTop('anime','1', 'airing');
            response.top.every(el => {
                let newResult = ({
                    mal_id: el.mal_id,
                    title: el.title,
                    img_url: el.image_url,
                    score: el.score,
                    episodes: el.episodes,
                });
                if (counter < TRENDING_AMOUNT) {
                    TOP_RESULT.push(newResult);
                    counter++;
                } else {
                    return false;
                }

                return true;
            });
            
            res.json(TOP_RESULT);
        } catch (error) {
            res.json({success: false});
            console.log(error);
        }
    }
);

module.exports = router;
