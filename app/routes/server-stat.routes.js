const express = require('express');
const router = express.Router();
const os = require('os');
const sources = require('../../public/external_sources.json');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const queryString = require('query-string');

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

router.post('/kofi-donation', async(req, res) => {
    try {
        WebHook_URl = `https://discord.com/api/webhooks/895087581677641769/Vk6tFDTHgwaCm3BdsS14zDPUJQHr80yVyndY07oRjMmcgMq2jMgefWXrcbhIojVN54IG`;
        //const WebHook_URl = `https://discord.com/api/webhooks/895076181681004554/yFnbKmRp1l4bx1WmBv_jF0hua4513hQEa513JnOEe-6upIAzUNEE65GBObp6hhV_7V3k`;
        let data = queryString.parse(req.body);
        data = data['data'];
        data = JSON.parse(data);
        const hook = new Webhook(`${WebHook_URl}`);
        const embed = new MessageBuilder()
        .setTitle(`From: ${data.from_name}`)
        .setAuthor(`${data.currency} ${data.amount}`)
        .setColor(`#85bb65`)
        .setDescription(`${data.message}`);

        hook.send(embed);

        return {
            statusCode:200,
            body: JSON.stringify({ message: 'Successfully sent message to discord server'})
        }
    } catch (error) {
        console.log(error);
        req.statusCode(500);     
    }
});

module.exports = router;