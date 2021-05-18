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
const os = require('os');

// const { database_population, database_clean } = require('./deploy/database_setup');
// const { sortEachAnimeSeason } = require('./app/services/cron_tasks/sort_each_anime_season');
// const { populateNewSeason } = require('./app/services/cron_tasks/add_new_anime_season');
const { populateDailyTop, } = require('./app/services/cron_tasks/get_daily_top'); 

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

app.use('/api/post', post);
app.use('/api/popular', popular);
app.use('/api/user', user);
app.use('/api/watch-anime', watchAnime);
app.use('/server-stat', async(req,res) => {
    try {
        String.prototype.toHHMMSS = function () {
            var sec_num = parseInt(this, 10); // don't forget the second param
            var hours   = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);
        
            if (hours   < 10) {hours   = "0"+hours;}
            if (minutes < 10) {minutes = "0"+minutes;}
            if (seconds < 10) {seconds = "0"+seconds;}
            var time    = hours+':'+minutes+':'+seconds;
            return time;
        }

        var time = process.uptime();
        var uptime = (time + "").toHHMMSS();
        let cpu = os.cpus();

        let result = {
            os : os.type(),
            cpu_model: cpu[0].model,
            ram: {
                free: numberWithCommas((os.freemem() / 1024 / 1024 ).toFixed(2)) + ' MB',
                used: numberWithCommas(((os.totalmem() / 1024 / 1024) - (os.freemem() / 1024 / 1024 )).toFixed(2)) + ' MB',
                total: numberWithCommas((os.totalmem() / 1024 / 1024).toFixed(2)) + ' MB',
            },
            uptime: uptime,
            
        }

        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        
        res.json(result);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

// Configuring the database
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const url = dbConfig.live_url;
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
const daily_db_workers = new cron("0 6 * * *", async() => {
    console.log('going maintenance mode updating Database . . .');
    await populateDailyTop();
    
})

daily_db_workers.start();

module.exports = app;
