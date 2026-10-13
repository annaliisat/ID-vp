const express = require ('express');
const router = express.Router();

//kasutatavad kontrollerid
const {
eestifilm,
inimesed,
inimesedAdd,
inimesedAddPost,
zanrid,
zanridAdd,
zanridAddPost,
ametid,
ametidAdd,
ametidAddPost} = require('../controllers/eestifilmControllers');

router.route('/').get(eestifilm);

router.route('/inimesed').get(inimesed);

router.route('/inimesed_lisa').get(inimesedAdd);

router.route('/inimesed_lisa').post(inimesedAddPost);

router.route('/zanrid').get(zanrid);

router.route('/zanrid_add').get(zanridAdd);

router.route('/zanrid_add').post(zanridAddPost);

router.route('/ametid').get(ametid);

router.route('/ametid_add').get(ametidAdd);

router.route('/ametid_add').post(ametidAddPost);

module.exports = router;