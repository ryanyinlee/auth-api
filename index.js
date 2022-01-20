'use strict';

const { db } = require('./src/auth/models');
const server = require('./src/server.js');
const port = process.env.PORT || 3000;

db.sync().then(() => {
  server.start(port);
});