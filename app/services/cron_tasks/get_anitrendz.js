require('dotenv').config();
const cheerio = require("whacko");
const rs = require("request");
const path = require('path');
const fs = require('fs');
const stringSimilarity = require("string-similarity");
const Top = require("../../models/top.model");

/* let buildTopWeek = async(callback) => {
    let url = `https://www.anime-xpress.com/poll-anime/`;
    let topOfTheWeek = [];
    rs(url, (err, resp, html) => {
        if (!err) {
          try {
            var $ = cheerio.load(html);
            $('.frm_text_label_for_image_inner').each(function (index, element) {
                let title = $(this).text();
                title = title.replace(/^[ ]+|[ ]+$/g,'');
                title = title.replace(/\n/g, '');
                title = title.replace(/\t/g, '');
                title = title.trim();
                topOfTheWeek[index] = {
                    title: title,
                }
            });
            
            let result = cleanUpTitles(topOfTheWeek);
            callback(result);
          } catch (e) {
            console.log(e);
          }
        }
      }); 
} */

let buildTopWeek = async(callback) => {
  let url = `https://kitsu.io/api/edge/trending/anime?limit=80`;
  let topOfTheWeek = [];
  rs(url, (err, resp, html) => {
      if (!err) {
        try {
          let data = JSON.parse(resp.body);
          data.data.forEach(el => {
            topOfTheWeek.push({
              mal_id: 0,
              img_url: el.attributes.posterImage.medium,
              score: 0,
              title: el.attributes.titles.en_jp,
              episodes: el.attributes.episodeCount,
            });
          });
          callback(topOfTheWeek.shuffle());
        } catch (e) {
          console.log(e);
        }
      }
    }); 
}

/* try find cover img ulr from animettv index list  */
let cleanUpTitles = (topOfTheWeek) => {
    let trueTopWeek = [];
    let res = [];

    try {
        let data_location = path.join(__dirname, '../../../anime-offline-database-minified.json');
        let data = fs.readFileSync(data_location, 'utf-8');
        data = JSON.parse(data);
        data = data['data'];
        
        for (let j = 0; j < topOfTheWeek.length; j++) {
          for (let i = 0; i < data.length; i++) {
            data[i].synonyms.forEach(el => {
              let similarity = stringSimilarity.compareTwoStrings(el, topOfTheWeek[j].title); 
              if ( similarity > 0.70) {
                trueTopWeek.push({
                  mal_id: 0,
                  img_url: data[i].picture,
                  score: 0,
                  title: data[i].title,
                  episodes: data[i].episodes
                });
              }
            });
          }
        }
        res = trueTopWeek.filter(Boolean);
        let res_2 = uniqByKeepLast(res, it => it.title);
        return res_2;
    } catch (e) {
        console.log(e);
    }
}

function uniqByKeepLast(data, key) {
  return [
    ...new Map(
      data.map(x => [key(x),x])
    ).values()
  ]
}

let updatedTopWeekly = async(top_of_the_week, callback) => {
  try {
    console.log(top_of_the_week);
    await Top.update_TOP_OF_THE_WEEK(top_of_the_week, (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        console.log('successfully updated TOP_OF_THE_WEEK');
        callback(null, result);
      }
    })
  } catch (error) {
    console.log(error);
  }
}

Array.prototype.shuffle = function() {
  let m = this.length, i;
  while (m) {
    i = (Math.random() * m--) >>> 0;
    [this[m], this[i]] = [this[i], this[m]]
  }
  return this;
}

module.exports = {
    buildTopWeek,
    updatedTopWeekly
}