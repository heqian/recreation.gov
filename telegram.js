const fetch = require('node-fetch')

class Telegram {
  constructor (token, id) {
    this.token = token
    this.id = id
  }

  message (content) {
    return fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: this.id,
        text: content
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

module.exports = Telegram
