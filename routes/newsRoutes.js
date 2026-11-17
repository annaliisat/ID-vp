const express = require('express');
const router = express.Router();

//kontrollerid
const{
	addnews} = require('../controllers/addnewsControllers');

router.route('/').get(addnews);

module.exports = router;