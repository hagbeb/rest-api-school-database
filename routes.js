// require express
const express = require('express');

// create new router
const router = express.Router();

// api/users route. GET current user
router.get('/users', (req, res) => {
    console.log('req.body: ', req.body);
    console.log('req.params: ', req.params);
    console.log('req.query: ', req.query);
    res.json(users);
});

// POST new user

// export the router
module.exports = router;