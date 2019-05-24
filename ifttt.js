const fetch = require('node-fetch')

class IFTTT {
  constructor (key) {
    this.key = key
  }

  webhook (event, value1, value2, value3, key = this.key) {
    return fetch(`https://maker.ifttt.com/trigger/${event}/with/key/${key}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        value1: value1,
        value2: value2,
        value3: value3
      })
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

module.exports = IFTTT
