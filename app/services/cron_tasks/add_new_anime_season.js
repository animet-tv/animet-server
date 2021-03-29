require('dotenv').config()
const Jikan = require('animet-jikan-wrapper');
const mal = new Jikan();
//mal.changeBaseURL(process.env.ANIMET_JIKAN_API_URL);
const SeasonAnime = require('../../models/season.model');

/* calculate season based on Northern hemispher */
exports.populateNewSeason = async (_year, _season) => {
    try {
        const season = _season;
        const year = _year;

        mal.findSeason(season, String(year)).then(
            result => {
                const newSeason = new SeasonAnime({
                    animeList: result
                });

                newSeason.save();
            }
        )

    } catch (error) {
        console.log(error);
    }
}  

exports.getCurrentSeason = () => {
    const getSeason = d => Math.floor((d.getMonth() / 12 * 4)) % 4
    return  ['winter', 'spring', 'summer', 'autumn'][getSeason(new Date())];
}