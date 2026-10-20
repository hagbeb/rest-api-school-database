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
  console.log('looking for credentials');
  let credentials;
  // Parse the user's credentials from the Authorization header.
  // check there's an authorization header first, otherwise parse will throw error...
  // ... as it wants a string
  if (req.headers.authorization) {
    credentials = parse(req.headers.authorization);
  }
  // If user credentials were submitted in the request...
  if (credentials) {
    // Attempt to retrieve the user from the data store by their email...
    // ...from the Authorization header).
    const user = await User.findOne({ where: {emailAddress: credentials.name} });
    // If a user email was successfully matched in the database...
    if (user) {
      // Use the bcrypt npm package to compare the (hashed versions of) user's password
      // ...from the Authorization header to the user password...
      // ...that was retrieved from the database.
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);
      // If the passwords match...
      if (authenticated) { // If the passwords match
        console.log(`Authentication successful for user: ${credentials.name}`);
        // Store the retrieved user object on the request object...
        // ...so any middleware functions that follow this middleware function...
        // ...will have access to the user's information.
        req.currentUser = user;
      } else {
        message = `User not found for username: ${credentials.name}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Authentication header not found';
  }
  // If the message variable has a value, we know that authentication failed.
  // If user authentication failed...
  if (message) {
    console.warn(message);
    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: 'Access Denied' });
    // Or if user authentication succeeded...
  } else {
    // ...call the next() method to go to next middleware.
    console.log('authentication successful, calling next middleware');
    next(); 
  }
};