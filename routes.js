// require express
const express = require('express');

// import bcrypt for hashing passwords
const bcrypt = require('bcryptjs');
// import express-validator
const { check, validationResult } = require('express-validator');

// import models
const User = require('./models').User;
const Course = require('./models').Course;

// Import autheticate middleware
const { authenticateUser } = require('./middleware/authenticate');

// create new router
const router = express.Router();

// Middleware wrapper so we don't need try/catch blocks on each route
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // if the error is a Sequelize Validation Error or UniqueConstraint error
      if(error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        // create an array of the error messages specifically to pass to the user
        const errors = error.errors.map(err => err.message);
        // respond with a 400 and the error messages
        res.status(400).json({ errors });
      } else {
        // This forwards the error to the global error handler in app.js
        next(error);
      }
    }
  }
}

// api/users route. GET current user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  // the following runs if authorization succeeded & authenticateUser called 'next()'
  // retrieve the current authenticated user's information
  const user = req.currentUser;
  res.status(200).json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  });
}));

// POST new user
// Wrap callback in asyncHandler to catch errors calling database
router.post('/users', asyncHandler(async (req, res) => {
  // Handle password length validation here as Sequelize checks the hashed version...
  // ... not the original
  // if the password exists
  if (req.body.password) {
    // Check password length. We do this here not via Sequelize as Sequelize...
    // ...validation was comparing to the hashed password, not the original
    if (req.body.password.length < 8 || req.body.password.length > 20) {
      // if the password is less than 8 or more than 20 characters
      res.status(400).json({ error:'Password must be between 8 and 20 characters.' });
    // if there are no password errors, hash the password
    } else {
      // Hash password
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }
  }
  // once password is checked/hashed, create a new user
  // Sequelize will handle validation for the other fields
  await User.create(req.body);
  // set location header on the response to root
  // Set the status to 201 Created and end the response.
  res.location('/').status(201).end(); 
}));

// retrieve all courses
router.get('/courses', asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    // list attributes we want to return - no createdAt or updatedAt
    attributes: [
      'id', 'title', 'description', 'materialsNeeded',
    ],
    // include the User related to each course
    include: [
      {
        model: User,
        as: 'User',
        // List attributes so that we don't return the password, createdAt & updatedAt
        attributes: ['id', 'firstName', 'lastName', 'emailAddress']
      }
    ]
  });
  // return the returned data as json with a 200 status
  res.status(200).json(courses);
}));

// retrieve single course by id
router.get('/courses/:id', asyncHandler(async (req, res) => {
  // use the id in the url from req.params to findByPk the relevant course
  const course = await Course.findByPk(req.params.id, {
    // list attributes we want to return - no createdAt or updatedAt
    attributes: [
      'id', 'title', 'description', 'materialsNeeded',
    ],
    // include the User related to each course
    include: [
      {
        model: User,
        as: 'User',
        // List attributes so that we don't return the password, createdAt & updatedAt
        attributes: ['id', 'firstName', 'lastName', 'emailAddress']
      }
    ]
  });
  // return the returned data as json with a 200 status
  res.status(200).json(course);
}));

// create a course.
// Authenticate user first as only logged in users are allowed to
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
  console.log('creating course');
  // create course
  const course = await Course.create(req.body);
  // set location header to new course page. Return 201 status. End with no content
  res.location(`/courses/${course.id}`).status(201).end();
}));

// update a course. authenticateUser first
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  console.log('updating course');
  // retrieve the course the user wants to update
  const course = await Course.findByPk(req.params.id);
  // Before updating, check the course belongs to the user:
  // if the user Id matches the userId of the course they want to update
  if (req.currentUser.id == course.userId) {
    // update the course using request body
    await course.update(req.body);
    // Return 204 status. End with no content
    res.status(204).end();
  // else, if the course is not theirs, return a 403 and message for the user.
  } else {
    res.status(403).json({ message: 'You do not have access to this course.' });
  }
}));

// delete a course. Again use authenticateUser to check if user is logged in
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  console.log('deleting course');
  // retrieve the course the user wants to delete
  const course = await Course.findByPk(req.params.id);
  // Check the course belongs to the user by comparing user id to courses foreign key:
  if (req.currentUser.id == course.userId) {
    // delete the course
    await course.destroy();
    // Return 204 status. End with no content
    res.status(204).end();
  // else, if the course is not theirs, return a 403 and message for the user.
  } else {
    res.status(403).json({ message: 'You do not have access to this course.' });
  }
}));

// export the router
module.exports = router;