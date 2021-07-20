require('dotenv').config();
const express = require('express');
const router = express.Router();
const SeasonAnime = require('../models/season.model');
const Jikan = require('animet-jikan-wrapper');
const mal = new Jikan();
const Top = require('../models/top.model');
const Post = require('../models/post.model');
mal.changeBaseURL(process.env.ANIMET_JIKAN_API_URL);
const Genre = require('../models/genres.model');
const Movie = require('../models/movies.model');
const PreparedTitle = require('../models/prepared-title.model');

const rateLimit = require("express-rate-limit");
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 1000
});

const seasonLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 5 minutes
    max: 1000
});

const defaultLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 5 minutes
    max: 2000
});


router.get(
    '/get-current-top-season',
    seasonLimiter, 
    async (req, res) => {
    try {

        const getSeason = d => Math.floor((d.getMonth() / 12 * 4)) % 4;
        const season = ['Winter', 'Spring', 'Summer', 'Autumn'][(getSeason(new Date()))];
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

// Backup NOT IMPLEMENTED
router.get(
    '/search', 
    searchLimiter,
    async (req, res) => {
    try {
        const term = req.query.word;
        const nsfw = req.query.NSFW;
        const RESULT = [];
        const param = {
            limit:14,
            order_by: 'title',
            rated: 'rx'
        }

        if (nsfw === 'false') {
            param.rated = 'r'
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
    defaultLimiter,
    async (req, res) => {
        try {         
            Top.getTrending((err, callback) => {
                if (err) {
                    res.sendStatus(404);
                }

                if (callback) {
                    res.json(callback[0].TRENDING);
                }
            });
        } catch (error) {
            res.json({success: false});
            console.log(error);
        }
    }
);

router.get(
    '/all-time-popular',
    defaultLimiter,
    async (req, res) => {
        try {         
            Top.getPopular((err, callback) => {
                if (err) {
                    res.sendStatus(404);
                }

                if (callback) {
                    res.json(callback[0].ALL_TIME_POPULAR);
                }
            });
        } catch (error) {
            res.json({success: false});
            console.log(error);
        }
    }
);


router.get(
    '/upcoming',
    defaultLimiter,
    async (req, res) => {
        try {     
            Top.getUpcoming((err, callback) => {
                if (err) {
                    res.sendStatus(404);
                }

                if (callback) {
                    res.json(callback[0].UPCOMING);
                }
            });
        } catch (error) {
            res.json({success: false});
            console.log(error);
        }
    }
);

router.get(
    '/on-going-series',
    defaultLimiter,
    async (req, res) => {
        try {     
            let pageNumber = Number(req.query.pageNumber);
            let result = await Top.getUpcoming(pageNumber);
            
            res.json(result[0].UPCOMING);
        } catch (error) {
            res.json({success: false});
            console.log(error);
        }
    }
);

router.get(
    '/all-time-popular-hentai',
    defaultLimiter,
    async (req, res) => {
        try {         
            
            let result = await Post.getTopHentai();
            
            res.json(result);
        } catch (error) {
            res.json({success: false});
            console.log(error);
        }
    }
);

router.get(
    '/genres',
    defaultLimiter,
    async (req,res) => {
        Genre.getAnimeGenres((err, result) => {
            if (err) {
                res.sendStatus(404);
                throw err;
            }
            res.json(result);
        })
    }
);

router.get(
    '/movies',
    defaultLimiter,
    async (req,res) => {
        Movie.getMovies((err, result) => {
            if (err) {
                res.sendStatus(404);
                throw err;
            }
            res.json(result);
        });
    }
);

router.get(
    '/prepared-title',
    async (req, res) => {
        try {
            PreparedTitle.getPreparedTitle((err, result) => {
                if (err) {
                    res.sendStatus(404);
                    throw err;
                }

                if (result) {

                    res.json(result);
                }
            })
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
);

module.exports = router;
