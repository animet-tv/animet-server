require('dotenv').config();
const cheerio = require("whacko");
const { delay } = require('bluebird');
const rs = require("request");
const { init } = require('../../models/top.model');
const animixplay_data_URL = 'https://animixplay.to/assets/s/all.json';
const axios = require('axios')
const PreparedTitle = require('../../models/prepared-title.model');

module.exports.populatePreparedTitle = async () => {
    try {
        let gogoanime_result = [];

        let fetchAnimixplay_data = async(callback) => {
            try {
                let url = animixplay_data_URL;
                axios
                    .get(url)
                    .then(res => {
                        callback(null, res.data);
                    })
                    .catch(error => {
                        console.error(error);
                        callback(null, false);
                    })
            } catch (error) {
                console.log(error);
                callback(null, false);
            }
        }

        let parseAnimixplay_data = async(data, type, callback) => {
            try {
                let result = [];
                if (type === 'gogoanime') {
                    data.forEach(el => {
                        if (el.e === '1') {
                            let item = ({
                                title: el.title,
                                id: el.id,
                            });
                            result.push(item);
                        }
                    });
                    callback(null, result);
                }
            } catch (error) {
                callback(null, false);
            }
        };
        const init = async () => {
            try {
                fetchAnimixplay_data((err, data) => {
                    if (err) {
                        console.log(err);
                    }

                    if (data) {
                        parseAnimixplay_data(data, 'gogoanime', (err, result) => {
                            if(err) {
                                console.log(err);
                            }

                            if (result) {
                                // drop old PreparedTitle
                                PreparedTitle.deleteMany({} , (err) => {
                                    if (err) {
                                        console.error(err);
                                        process.exit(1);
                                    }
                                
                                    console.log('PreparedTitle cleared ', new Date());
                                });

                                // save new PreparedTitle
                                let newPreparedTitle = new PreparedTitle ({
                                    gogoanime: result,
                                });

                                newPreparedTitle.save();
                                console.log('new PreparedTitle saved ', new Date());
                                
                            }
                        })
                    }
                })
            } catch (error) {
                console.log(error);
            }
        }

        init()
    } catch (error) {
        console.log(error);
    }
}