module.exports = {
    local_url: 'mongodb://localhost:27017/animet-db',
    live_url:  process.env.live_url,
    secret: process.env.passport_secret,
}
