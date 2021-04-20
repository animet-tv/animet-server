require('dotenv').config();
const express = require('express');
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');
const dbConfig = require('./app/config/mongodb.config');
const passport = require('passport');
const cron = require('cron').CronJob;

// const { database_population, database_clean } = require('./deploy/database_setup');
// const { sortEachAnimeSeason } = require('./app/services/cron_tasks/sort_each_anime_season');
// const { populateNewSeason } = require('./app/services/cron_tasks/add_new_anime_season');
const { populateDailyTop, } = require('./app/services/cron_tasks/get_daily_top'); 

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Passport Middleware 
app.use(passport.initialize());
app.use(passport.session());

require('./app/config/passport')(passport);


// ROUTES
const post = require('./app/routes/post.routes');
const popular = require('./app/routes/popular.routes');
const user = require('./app/routes/user.routes');
const watchAnime = require('./app/routes/watch-anime.routes');

app.use('/api/post', post);
app.use('/api/popular', popular);
app.use('/api/user', user);
app.use('/api/watch-anime', watchAnime);

// Configuring the database
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const url = process.env.LIVE_URL;
//const url = dbConfig.local_url;
const connectDB = async () => {
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false
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


/* populateDailyTop(); */


// Devlopment
/* database_clean(); */
/* database_population(); */

/* CRON tasks every midnight hours */
const daily_db_workers = new cron('0 0 6 * *  *', function() {
    console.log('going maintenance mode runing tasks');
    populateDailyTop();
   
})

daily_db_workers.start();

module.exports = app;
