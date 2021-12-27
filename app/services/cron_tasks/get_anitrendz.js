require('dotenv').config();
const cheerio = require("whacko");
const rs = require("request");
const path = require('path');
const fs = require('fs');
const stringSimilarity = require("string-similarity");
const Top = require("../../models/top.model");

let buildTopWeek = async(callback) => {
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
}

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
    Top.update_TOP_OF_THE_WEEK(top_of_the_week, (err, result) => {
      if (err) {
        console.log(err);
      }
      if (result) {
        console.log('successfully updated TOP_OF_THE_WEEK');
        callback(null, true);
      }
    })
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
    buildTopWeek,
    updatedTopWeekly
}