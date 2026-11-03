const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp');

//@desc page for uploading photos to gallery
//@route GET /galleryPhotoUpload
//@access public

const galleryPhotoUpload = (req, res) => {
	res.render('galleryphotoupload');
};

//@desc page for uploading photos to gallery
//@route POST /galleryPhotoUpload
//@access public

const galleryPhotoUploadPost = async (req, res) => {
	//console.log(req.file);
	//console.log(req.body);
	let conn;
	try {
		//genereerida oma failinime
		const fileName = 'vp_' + Date.now() + '.jpg';
		const path = require('path');
		await fs.rename(req.file.path, path.join(req.file.destination, fileName));
		//pildi vÃ¤iksemaks  muutmine
		// suur pilt vesimärgiga
await sharp(req.file.destination + fileName)
    .resize(800,600)
    .composite([
        {
            input: './public/pic/vp_logo_small.png',
            gravity: 'southeast'
        }
    ])
    .jpeg({quality:90})
    .toFile(process.env.UPLOAD_ORIGINAL_PATH + fileName);

// pisipilt
await sharp(req.file.destination + fileName)
    .resize(100,100)
    .jpeg({quality:90})
    .toFile(process.env.UPLOAD_ORIGINAL_PATH + fileName);
		let sqlReq = 'INSERT INTO galleryphotos (filename, origname, alttext, privacy, userid) VALUES (?,?,?,?,?)';
		const userId = 1; //see on ajutine, kuni teeme kasutajakontod ja sisselogimise
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const [result]  = await conn.execute(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId]);
		console.log('Salvestati foto kirje id: ' + result.insertId);
		res.render('galleryphotoupload');
	}
	catch (err) {
		console.log('Viga: ' + err);
		res.render('galleryphotoupload');
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

const photoGallery = async (req, res) => {

    let conn;

    try{

        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const sqlReq = `
            SELECT filename, alttext
            FROM galleryphotos
            WHERE privacy >= 2
            AND deleted IS NULL
            ORDER BY id DESC
        `;

        const [photos] = await conn.execute(sqlReq);

        res.render('photogallery', {
            photos: photos
        });

    } catch(err){
        console.log(err);
    } finally{
        if(conn){
            await conn.end();
        }
    }
};

module.exports = {
	galleryPhotoUpload,
	galleryPhotoUploadPost,
	photoGallery
}