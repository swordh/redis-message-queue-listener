'use strict'

const fs = require('fs')
const dateFormat = require('dateformat')
const ioredis = require('ioredis')

var config = {}

readConfig()
    .then(() => connect())
    .catch(err => {
        console.log(err)
        process.exit(1)
    })

function readConfig() {
    return new Promise((resolve, reject) => {
        try {
            // Get settings from the config file
            console.log('Reading config file')
            var configFile = fs.readFileSync('config.json')
            config = JSON.parse(configFile)
            resolve()
        } catch (err) {
            // if file doesn't exist create a config file
            console.log('Unable to read config file, using defaults ' + err)
            fs.writeFile(
                // create config file
                'config.json',
                JSON.stringify(
                    {
                        redis: {
                            port: 6379,
                            host: '127.0.0.1',
                            family: 4,
                            password: 'auth',
                            db: 0
                        }
                    },
                    null,
                    2
                ),
                function(err) {
                    if (err) {
                        reject('Unable to create new config file. ' + err)
                    } else {
                        reject('New config file created, edit it appropriatly')
                    }
                }
            )
        }
    })
}

function connect() {
    return new Promise((resolve, reject) => {
        var sub = new ioredis(config.redis)
        sub.on('ready', () => {
            console.log('Connected')
            resolve()
        })

        sub.on('error', err => {
            console.error(err)
        })

        sub.on('pmessage', (pattern, channel, message) => {
            var date = new Date()
            console.log('')
            console.log(
                '============ ' +
                    dateFormat(date, 'isoDateTime') +
                    ' ============'
            )
            console.log('Channel')
            console.log(channel)
            console.log('Message')
            console.log(message)
        })

        sub.psubscribe('*')
    })
}
