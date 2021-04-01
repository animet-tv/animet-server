const express = require('express');
const router = express.Router();
const { getCurrentSeason } = require('../services/cron_tasks/add_new_anime_season');
const SeasonAnime = require('../models/season.model');
const Jikan = require('animet-jikan-wrapper');
const mal = new Jikan();
//mal.changeBaseURL(process.env.ANIMET_JIKAN_API_URL);
const Top = require('../models/top.model');
const TRENDING_AMOUNT = 20;

const rateLimit = require("express-rate-limit");
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 1000
});

const seasonLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 500
});

const trendingLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 700
});


router.get(
    '/get-current-top-season',
    seasonLimiter, 
    async (req, res) => {
    try {
        const getSeason = d => Math.floor((d.getMonth() / 12 * 4)) % 4;
        const season = ['Winter', 'Spring', 'Summer', 'Autumn'][(getSeason(new Date())-1)];
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

router.get(
    '/get-seasons-data',
    seasonLimiter, 
    async (req, res) => {
    try {
        const AVAILABLE_SEASONS = await SeasonAnime.getSeasonsDetail();
        res.json(AVAILABLE_SEASONS);
    } catch (error) {
        console.log(error);
    }
});

router.get(
    '/search', 
    searchLimiter,
    async (req, res) => {
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
            limit:14,
            order_by: 'title',
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
    trendingLimiter,
    async (req, res) => {
        try {         
            let result = await Top.getTrending();
            
            res.json(result[0].TRENDING);
        } catch (error) {
            res.json({success: false});
            console.log(error);
        }
    }
);

router.get(
    '/popular',
    trendingLimiter,
    async (req, res) => {
        try {         
            let result = await Top.getPopular();
            
            res.json(result[0].ALL_TIME_POPULAR);
        } catch (error) {
            res.json({success: false});
            console.log(error);
        }
    }
);


router.get(
    '/upcoming',
    trendingLimiter,
    async (req, res) => {
        try {         
            let result = await Top.getUpcoming();
            
            res.json(result[0].UPCOMING);
        } catch (error) {
            res.json({success: false});
            console.log(error);
        }
    }
);

module.exports = router;
