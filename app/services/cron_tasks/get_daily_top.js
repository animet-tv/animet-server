require('dotenv').config();
const Top = require('../../models/top.model');
const Jikan = require('animet-jikan-wrapper');
const { delay } = require('bluebird');
const mal = new Jikan();
mal.changeBaseURL(process.env.ANIMET_JIKAN_API_URL);

// get top 500 of each type 
module.exports.populateDailyTop = async () => {
    try {
        var _TRENDING = [];
        var _ALL_TIME_POPULAR = [];
        var _UPCOMING = [];


        // Fetch anime data by subtype
        const fetchAnimeData_by_subType = async(list_name, subtype, waitAmountPerRequest = 3000, pages = 4) => {
            try {
                for (let i = 1; i < pages; i++) { 
                    let result = await mal.findTop('anime',`${i}`, `${subtype}`);
                    result.top.forEach(el => {
                        let newResult = ({
                            mal_id: el.mal_id,
                            title: el.title,
                            img_url: el.image_url,
                            score: el.score,
                            episodes: el.episodes,
                        });
                        list_name.push(newResult);
                    });
                    await delay(waitAmountPerRequest);
                    console.log(`gathering dailys page:${i}`);
                }
            } catch (error) {
                console.log(error);
            }
        }

        // Update lsit title to english title 
        const updateTitle_to_englishTitle = async (list_name, waitAmountPerRequest = 3000) => {
            try {
               /*  for(let i = 1; i<list_name.length; i++) {
                    console.log(`${list_name[i].mal_id}` );
                    let mal_id_res = await mal.findAnime(`${list_name[i].mal_id}`,'/','1');
                    console.log(mal_id_res);
                    list_name[i].title = mal_id_res.title_english;
                    await delay(waitAmountPerRequest);
                } */

                for (let i = 0; i < list_name.length; i++) {
                    let mal_id_res = await mal.findAnime(`${list_name[i].mal_id}`);
                    if (mal_id_res.title_english != null) {
                        list_name[i].title = mal_id_res.title_english; 
                    }
                    console.log('updated title to english: ', i);
                    await delay(waitAmountPerRequest);     
                }

            } catch (error) {
                console.log(error);
            }
        }

        const init = async () => {
            try {
                // TRENDING
                await fetchAnimeData_by_subType(_TRENDING, 'airing');
                // ALL_TIME_POPULAR
                await fetchAnimeData_by_subType(_ALL_TIME_POPULAR, 'bypopularity');
                // UPCOMING
                await fetchAnimeData_by_subType(_UPCOMING, 'upcoming');

                // update all list title to english title
                /* await updateTitle_to_englishTitle(_TRENDING);
                await updateTitle_to_englishTitle(_ALL_TIME_POPULAR);
                await updateTitle_to_englishTitle(_UPCOMING); */
                console.log('Updated Daily Top', ' ' , new Date());
            } catch (error) {
                console.log(error);
            }
        }
        
        // Run
        await init();

        // Drop old Top object
        Top.deleteMany({} , (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
        
            console.log('All Tops cleared');
            });

        // create new Top object
        const newTopData = new Top({
            TRENDING: _TRENDING,
            ALL_TIME_POPULAR: _ALL_TIME_POPULAR,
            UPCOMING: _UPCOMING,
        });
        
        // save new Top object
        newTopData.save();
        
    } catch (error) {
        console.log(error);
    }
}

module.exports.cleanDailyTop = () => {
    Top.deleteMany({} , (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
  
      console.log('All Tops cleared');
    });
}