const querystring = require('querystring')
const fetch = require('node-fetch')
const moment = require('moment')

class Campground {
  constructor (id) {
    this.id = id
  }

  getData (date) {
    let query = {
      'start_date': moment.utc(date).toISOString()
    }

    let apiUrl = `https://www.recreation.gov/api/camps/availability/campground/${this.id}/month?${querystring.stringify(query)}`

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
