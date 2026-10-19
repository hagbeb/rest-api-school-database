// require express
const express = require('express');

// import bcrypt for hashing passwords
const bcrypt = require('bcryptjs');

// import express-validator
const { check, validationResult } = require('express-validator');

// create new router
const router = express.Router();

// import models
const User = require('./models').User;
const Course = require('./models').Course;

// Import autheticate middleware
const { authenticateUser } = require('./middleware/authenticate');

// Middleware wrapper so we don't need try/catch blocks on each route
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      // This forwards the error to the global error handler in app.js
      next(error);
    }
  }
}
// api/users route. GET current user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  // the following runs if authorization succeeded & authenticateUser called 'next()'
  // retrieve the current authenticated user's information
  const user = req.currentUser;
  console.log('setting response with 200 status');
  res.status(200).json({
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  });
}));

// POST new user
// Use express-validator to pass in validator checks
// Wrap callback in asyncHandler to catch errors calling database
router.post('/users', [
  check('firstName')
    .exists()
    .notEmpty()
    .withMessage('Please provide a value for firstName'),
  check('lastName')
    .exists()
    .notEmpty()
    .withMessage('Please provide a value for lastName'),
  check('emailAddress')
    .exists()
    .notEmpty()
    .withMessage('Please provide an email address'),
  check('password')
    .exists()
    .notEmpty()
    .withMessage('Please provide a password'),
], asyncHandler(async (req, res) => {
        console.log('req.body: ', req.body);
  // Attempt to get the validation result from the Request object.
  const errors = validationResult(req);
    console.log('errors: ', errors);
  // If there are validation errors...
  if (!errors.isEmpty()) {
  // Use the Array `map()` method to get a list of error messages.
    const errorMessages = errors.array().map(error => error.msg);
    // Return the validation errors to the client.
    res.status(400).json({ errors: errorMessages });
    // if there no errors...
  } else {
    // Hash password
    req.body.password = bcrypt.hashSync(req.body.password, 10);
    // create a new user
    await User.create(req.body);
    // set location header on the response to root
    res.location('/');
    // Set the status to 201 Created and end the response.
    res.status(201).end();
  }
}));

// export the router
module.exports = router;