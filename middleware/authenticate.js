'use strict';
// import basic-auth
const { parse } = require('basic-auth');
// import user model
const { User } = require('../models');
// import bcrpyt
const bcrypt = require('bcryptjs');

// Middleware to authenticate the request using Basic Auth.
exports.authenticateUser = async (req, res, next) => {
  let message; // store the message to display
  // Parse the user's credentials from the Authorization header.
  const credentials = parse(req.headers.authorization);
  console.log('credentials: ', credentials);
  // If the user's credentials are available...
  if (credentials) {
    // Attempt to retrieve the user from the data store by their email...
    // ...from the Authorization header).
    const user = await User.findOne({ where: {emailAddress: credentials.name} });
    // If a user was successfully retrieved from the database...
    if (user) {
      // Use the bcrypt npm package to compare the user's password
      // (from the Authorization header) to the user's password
      // that was retrieved from the data store.
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);
      // If the passwords match...
      if (authenticated) { // If the passwords match
        console.log(`Authentication successful for user: ${credentials.name}`);
        // Store the retrieved user object on the request object
        // so any middleware functions that follow this middleware function
        // will have access to the user's information.
        req.currentUser = user;
      } else {
        message = `User not found for username: ${credentials.name}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }
  // If the message variable has a value. In that case, we know that a failure occurred.
  // If user authentication failed...
  if (message) {
    console.warn(message);
    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: 'Access Denied' });
    // Or if user authentication succeeded...
  } else {
    console.log('no error message, so calling next in authenticate middleware');
    // ...call the next() method to go to next middleware.
    next(); 
  }
};