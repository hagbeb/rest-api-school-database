'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
// load routes.js
const routes = require('./routes');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();
// parse json in request body
app.use(express.json());

// import sequelize (which is property of exported 'db' object in models/index.js)
var sequelize = require('./models').sequelize;

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// when a request starts with '/api', use the routes in the routes.js file
app.use('/api', routes);

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

(async () => {
  try {
    // sequlize.sync will sync all models
    await sequelize.sync();
    // authenticate
    await sequelize.authenticate();
    console.log('Connection to the database successful!');
  } catch (error) {
    console.error('Error syncing or connecting to the database: ', error);
  }
})();