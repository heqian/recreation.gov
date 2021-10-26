require('dotenv').config()

const _ = require('lodash')
const Schedule = require('node-schedule')
const Campground = require('./campground')
const Telegram = require('./telegram')
const IFTTT = require('./ifttt')

const campground = new Campground(process.env.CAMPGROUND_ID)
const campsites = _.isEmpty(process.env.CAMPSITES) ? [] : process.env.CAMPSITES.split(',')
const months = _.isEmpty(process.env.MONTHS) ? [] : process.env.MONTHS.split(',')
const days = _.isEmpty(process.env.DAYS_OF_WEEK) ? [] : process.env.DAYS_OF_WEEK.split(',')
const iftttKeys = _.isEmpty(process.env.IFTTT_KEYS) ? [] : process.env.IFTTT_KEYS.split(',')

const telegram = new Telegram()
const ifttt = new IFTTT()

// Cron
Schedule.scheduleJob('*/15 * * * *', async date => {
  console.info(date)

  months.forEach(async month => {
    const data = await campground.getData(month)
    if (data.campsites) {
      _.each(data.campsites, (campsite, campsiteId) => {
        _.each(campsite.availabilities, async (availability, date) => {
          // Monitor given campsites or all campsites
          if (campsites.length) {
            if (!_.includes(campsites, campsite.site)) {
              return
            }
          }

          if (days.length) {
            const day = new Date(date).getUTCDay()
            if (!_.includes(days, day.toString())) {
              return
            }
          }

          // Notify the user
          if (availability === 'Available') {
            console.info(date, availability)

            if (!_.isEmpty(process.env.TELEGRAM_BOT_TOKEN) && !_.isEmpty(process.env.TELEGRAM_CHAT_ID)) {
              telegram.message(
                `${campsite.loop} - ${campsite.site}: ${new Date(date).toUTCString().substr(0, 16)}. https://www.recreation.gov/camping/campgrounds/${campground.id}/availability`,
                process.env.TELEGRAM_BOT_TOKEN,
                process.env.TELEGRAM_CHAT_ID
              )
            }

            _.each(iftttKeys, async key => {
              ifttt.webhook(
                process.env.IFTTT_EVENT,
                new Date(date).toString(),
                `${campsite.loop} - ${campsite.site}`,
                `https://www.recreation.gov/camping/campgrounds/${campground.id}/availability`,
                key
              )
            })
          }
        })
      })
    }
  })
})
