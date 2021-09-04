const cheerio = require("whacko");
const rs = require("request");
const path = require('path');
const fs = require('fs');
const { delay } = require('bluebird');
const { del } = require("request");

const updateMediaFireURLs = async() => {
    try {
        let anime60Titles = ['demonslayer_60fps.json', 'shingeki_no_kyojin_the_final_season_60fps.json']
        console.log();
        for (let i = 0; i < anime60Titles.length; i++) {
            let result = [];
            let array_Title = await readJson(anime60Titles[i])
            
            // for each url find download url and append
            for (let j = 0; j < array_Title.anime60fps.length; j++) {
                let url = array_Title.anime60fps[j].mediafire_url;
                if (url !== undefined) {
                    rs(url, (err, resp, html) => {
                        if (!err) {
                            let $ = cheerio.load(html);
                            let src = $('#downloadButton').attr().href;
                            
                            let newResultItem = {
                                mediafire_url: url,
                                mediafire_download_url: src,
                                en_subtitle_url: array_Title.anime60fps[j].en_subtitle_url,
                                episode_number: array_Title.anime60fps[j].episode_number,
                            }
                            result.push(newResultItem);
                            console.log(`Progress: ${Math.floor((j / array_Title.anime60fps.length) * 100)}%`);
                        }
                    })
                    await delay(Math.floor(getRandomArbitrary(3000, 6500)));
                }
            }
            // overwrite old json 
            let newJsonData = {
                anime60fps: result
            }
            await writeJson(newJsonData,anime60Titles[i])
                .then(() => {
                    console.log(`Successfully saved ${anime60Titles[i]}`);
                })
                .catch( err => {
                    console.log(err);
                });
        }


    } catch (error) {
        console.log(error);
    }
}

const readJson = async(fileName) => {
    try {
        const filePath = path.join(__dirname+ '../../../../anime60/' + fileName);
    
        let rawData = fs.readFileSync(filePath);
        let array = JSON.parse(rawData);
        return Promise.resolve(array);
    } catch (error) {
        console.log(error);
        return Promise.reject();
    }
}

const writeJson = async(JsonData, fileName) => {
    try {
        const filePath = path.join(__dirname+ '../../../../anime60/' + fileName);
        let data = JSON.stringify(JsonData);
        fs.writeFileSync(filePath, data);
    } catch (error) {
        console.log(error);
    }
}

const initMediaFire = async() => {
    try {
        console.log('started ');
        await updateMediaFireURLs();
    } catch (error) {
        console.log();
    }
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

module.exports = {
    updateMediaFireURLs,
    initMediaFire
}