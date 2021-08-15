require('dotenv').config();
const rs = require("request");
const animet_stream_api = process.env.ANIMET_STREAM_API_URL;
const RecentlyAdded = require("../../models/recently-added.model");
const { delay } = require('bluebird');
const HelperService = require('../helper-service');

let populateRecentlyAdded = async() => {
    try {
        let recentlyAdded = [];
        // fetch recently added first 2 pages
        let page = 1;
        while(page < 4) {
            let url = `${animet_stream_api}api/recentlyadded/${page}`;
            console.log(url);
            rs(url, (err, resp, html) => {
                if (!err) {
                  try {
                    // parse json to array obj
                    let result = JSON.parse(resp.body);
                    result = result.results;
                    
                    result.forEach(el => {
                        recentlyAdded.push({
                            title: el.title,
                            id: el.id,
                            episodeNumber:  Number(el.episodenumber),
                            img_url: el.image
                        });
                    });
                   
                  } catch (e) {
                    console.log(e);
                  }
                }
              }); 

              await delay(3000);
              page++;
        }

        const newRecentlyAdded = new RecentlyAdded({
            gogoanime: recentlyAdded
        });
        
        newRecentlyAdded.save();
        console.log('RecentlyAdded saved');

       /*  HelperService.appendTitlesToPreparedTitle_IF_NOT_EXISTS(recentlyAdded, (err,callback) => {
            try {
                if (err) {
                    console.log(err);
                } 
                console.log(callback);
            } catch (error) {
                
            }
        }) */

    } catch (error) {
        console.log(error);
    }
}

let cleanRecentlyAdded = async() => {
    try {
        RecentlyAdded.deleteMany({} , (err) => {
            if (err) {
              console.error(err);
              process.exit(1);
            }
        
            console.log('RecentlyAdded cleared');
          });
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    cleanRecentlyAdded,
    populateRecentlyAdded
}