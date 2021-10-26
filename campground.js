const fetch = require('node-fetch')
const moment = require('moment')

class Campground {
  constructor (id) {
    this.id = id
  }

  getData (date) {
    const query = new URLSearchParams({
      start_date: moment.utc(date).toISOString()
    })

    const apiUrl = `https://www.recreation.gov/api/camps/availability/campground/${this.id}/month?${query.toString()}`

    return fetch(apiUrl, {
      method: 'GET'
    }).then(response => {
      if (response.headers.get('content-type').includes('application/json')) {
        return response.json()
      } else {
        return null
      }
    }).catch(error => {
      console.error(error)
    })
  }
}

module.exports = Campground
