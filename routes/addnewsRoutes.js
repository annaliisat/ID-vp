const express = require('express');
const router = express.Router();
const newsController = require('./controllers/addnewsControllers');
const multer = require('multer');
//kaust kuhu pildid salvestatakse
const upload = multer({ dest: './public/uploads/' });

//kontroll, kas kasutaja on sisselogitud
function checkLogin(req, res, next) {
	if (req.session && req.session.userId) {
	return next();
	}
	res.redirect('/signin');
}

//uudiste lisamise vorm ja salvestamine
router.get('/addnews', checkLogin, newsController.getAddNewsForm);
router.post('/addnews', checkLogin, upload.single('newsPhoto'), newsController.postAddNews);

//uudiste lugemise leht
router.get('/news', checkLogin, newsController.getAllNews);

module.exports = router;