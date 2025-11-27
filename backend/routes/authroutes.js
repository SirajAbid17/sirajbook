const express = require('express');
const { signup, signin, signout, sendotp, verifyotp, resetpassword } = require('../controller/authcontroller');
const authroute = express.Router();

authroute.post('/signup', signup);
authroute.post('/signin', signin);
authroute.get('/signout', signout);
authroute.post('/sendotp', sendotp);
authroute.post('/verifyotp', verifyotp);
authroute.post('/resetpassword', resetpassword);

module.exports = authroute;