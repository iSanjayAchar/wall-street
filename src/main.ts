import 'dotenv/config'
import WebSocket from 'ws'
import dayjs from 'dayjs'
import { Config } from './config.js'
import { Write } from './services/mongodb.js'
import * as Sentry from '@sentry/node'

/**
 * Initializing sentry
 */
Sentry.init({
  dsn: 'https://e517209df3c143f2af3c4ddea70188ed@o4504253951115264.ingest.sentry.io/4504253952622592',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

const socketConfig: WebSocket.ClientOptions = {
  perMessageDeflate: false,
}

const socket = new WebSocket('wss://ws-plus.olymptrade.com/connect', socketConfig)

socket.on('open', function open() {
  socket.send('[{"e":1000,"t":2,"d":{"pairs":["ASIA_X"]},"uuid":"2"}]')
})

socket.on('message', async data => {
  try {
    const object = JSON.parse(data.toString())
    if (!object || !object[0] || !object[0].d[0]) {
      return
    }

    const { t, m } = object[0].d[0]
    await Write(Config.pair.default, new Date(dayjs.unix(t).toISOString()), m)
  } catch (err) {
    Sentry.captureException(err)
  }
})
