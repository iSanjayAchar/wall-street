import 'dotenv/config';
import WebSocket from 'ws';
import dayjs from 'dayjs';
import { Config } from './config';
import { Write } from './services/mongodb';

const socketConfig: WebSocket.ClientOptions = {
  perMessageDeflate: false,
};

const socket = new WebSocket('wss://ws-plus.olymptrade.com/connect', socketConfig);

socket.on('open', function open() {
  socket.send('[{"e":1000,"t":2,"d":{"pairs":["ASIA_X"]},"uuid":"2"}]');
});

socket.on('message', async (data) => {
  const object = JSON.parse(data.toString());
  if (!object || !object[0] || !object[0].d[0]) {
    return;
  }

  const { t, m } = object[0].d[0];
  await Write(
    Config.pair.default, 
    new Date(dayjs.unix(t).toISOString()), 
    m
  );
  console.log('Wrote to database');
});