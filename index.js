require('dotenv').config()

const _ = require('lodash')
const Schedule = require('node-schedule')
const Campground = require('./campground')
const Telegram = require('./telegram')

const telegram = new Telegram(process.env.TELEGRAM_BOT_TOKEN, process.env.TELEGRAM_CHAT_ID)
const campground = new Campground(process.env.CAMPGROUND_ID)
const campsites = process.env.CAMPSITES ? process.env.CAMPSITES.split(',') : []
const months = process.env.MONTHS ? process.env.MONTHS.split(',') : []
const days = process.env.DAYS_OF_WEEK ? process.env.DAYS_OF_WEEK.split(',') : []

// Every Minute
Schedule.scheduleJob('*/15 * * * *', async date => {
  console.info(date)

  months.forEach(async month => {
    let data = await campground.getData(month)

    // The user is on call
    if (data === null) {
      await telegram.message(`Month: ${month}`)
    }

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
            let day = new Date(date).getUTCDay()
            if (!_.includes(days, day.toString())) {
              return
            }
          }

          // Notify the user
          if (availability === 'Available') {
            let message = `${campsite.loop} - ${campsite.site}: ${new Date(date)}. https://www.recreation.gov/camping/campgrounds/${campground.id}/availability`
            await telegram.message(message)
            console.info('Sent:', message)
          }
        })
      })
    }
  })
})
