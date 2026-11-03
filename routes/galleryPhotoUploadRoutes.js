const express = require('express');
const multer = require('multer');

const router = express.Router();

//seadistame multer vahevara (middleware) failide Ã¼leslaadimiseks
//määran üleslaadimise kataloogi

console.log('UPLOAD_ORIGINAL_PATH =', process.env.UPLOAD_ORIGINAL_PATH);

const upload = multer({
	dest: process.env.UPLOAD_ORIGINAL_PATH
});
//määrata saab veel näiteks lubatud failitüüpe, faili suuruse piirangut jne

//kontrollerid
const{
	galleryPhotoUpload,
	galleryPhotoUploadPost,
	photoGallery
} = require('../controllers/galleryPhotoUploadControllers');

router.route('/').get(galleryPhotoUpload);

//post osa suunatakse läbi vahevara - upload
router.route('/').post(upload.single('photoInput'), galleryPhotoUploadPost);

router.get('/gallery', photoGallery);

module.exports = router;