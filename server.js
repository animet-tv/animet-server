require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');
const dbConfig = require('./app/config/mongodb.config');
const passport = require('passport');
const cron = require('cron').CronJob;
const compression = require('compression');

// const { database_population, database_clean } = require('./deploy/database_setup');
// const { sortEachAnimeSeason } = require('./app/services/cron_tasks/sort_each_anime_season');
// const { populateNewSeason } = require('./app/services/cron_tasks/add_new_anime_season');
const { populateDailyTop } = require('./app/services/cron_tasks/get_daily_top'); 
const animixplay = require('./app/services/cron_tasks/get_animixplay_data');
const recentlyadded = require('./app/services/cron_tasks/get_recently_added');
const spotlight = require('./app/services/cron_tasks/get_spotlight');
const mediafire = require('./app/services/cron_tasks/update_mediafire_src');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
// Passport Middleware 
app.use(passport.initialize());
app.use(passport.session());

require('./app/config/passport')(passport);


// ROUTES
const post = require('./app/routes/post.routes');
const popular = require('./app/routes/popular.routes');
const user = require('./app/routes/user.routes');
const watchAnime = require('./app/routes/watch-anime.routes');
const serverStat = require('./app/routes/server-stat.routes');

app.use('/api/post', post);
app.use('/api/popular', popular);
app.use('/api/user', user);
app.use('/api/watch-anime', watchAnime);
app.use('/server-stat', serverStat);

// Configuring the database
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const url = dbConfig.live_url;
const connectDB = async () => {
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB.");
        /* test_data.initial_testData(); */
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
// Connecting to the database
connectDB();


// handel favicon request
app.get('/favicon.ico', (req, res) => res.status(204));


/* populateDailyTop(); */
/* animixplay.populatePreparedTitle(); */
/* animixplay.populateMovies(); */

// Devlopment
/* database_clean(); */
/* database_population(); */
/* recentlyadded.cleanRecentlyAdded();
recentlyadded.populateRecentlyAdded() */
/* spotlight.buildWeeklySpotlight() */
/* let a = (async() => {
    await mediafire.initMediaFire();
})

a(); */
/* CRON tasks every day hours */
const daily_db_workers = new cron("0 6 * * *", async() => {
    console.log('going maintenance mode updating Database . . .');
    await populateDailyTop();
    await animixplay.populatePreparedTitle();
    await recentlyadded.cleanRecentlyAdded();
    await recentlyadded.populateRecentlyAdded();
    await mediafire.initMediaFire();

    console.log('done updating database') 
});
/* CRON tasks every week on sunday 8:05am */
const weekly_db_workers = new cron("5 8 * * 6", async() => {
    console.log('going maintenance mode updating Database . . .');
    await spotlight.buildWeeklySpotlight();
    console.log('done updating database')
    
});
daily_db_workers.start();
weekly_db_workers.start();

module.exports = app;
