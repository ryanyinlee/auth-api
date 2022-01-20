'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
// const { Sequelize, DataTypes } = require('sequelize');
const userSchema = require('./auth/models/users.js');
// const UserModel = userSchema(sequelize, DataTypes);
// const acl = require('./middleware/acl.js');


const notFoundHandler = require('./error-handlers/404.js');
const errorHandler = require('./error-handlers/500.js');


const authRoutes = require('./auth/routes/routes.js');

const v2Routes = require('./auth/routes/v2.js');

const app = express();

app.use(express.json());

// App Level MW
app.use(cors());
app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));
// Routes
app.use(authRoutes);
app.use('/api/v2', v2Routes);

app.use('*', notFoundHandler);
app.use(errorHandler);

module.exports = {
  server: app,
  start: port => {
    if (!port) { throw new Error('Missing Port'); }
    app.listen(port, () => console.log(`Listening on ${port}`));
  }, app,
};