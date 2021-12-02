const express = require('express');
const router = express.Router();
const os = require('os');
const sources = require('../../public/external_sources.json');
const MetricaStats = require('../models/metrica-stats.model');

router.get('/', async(req,res) => {
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
});

router.get('/working-sources', async(req ,res) => {
    try {
        res.json(sources);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get('/total-sessions-today', async(req,res) => {
    try {
         MetricaStats.getTotalSessionToday((err, result) => {
            if (err) {
                console.log(err);
                res.sendStatus(404);
            } 
            if (result) {
                res.json(result);
             }
         })
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

module.exports = router