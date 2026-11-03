const express = require('express');
const fs = require('fs').promises;
//moodul POST päringute lahtiharutamiseks, parsimiseks
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks (koos async ehk ootamise osaga)
const mysql = require('mysql2/promise');
//moodul .env keskkonnamuutujate lugemiseks
require('dotenv').config();
require('dotenv').config({ path: __dirname + '/.env' });

const dateET = require('./src/dateTimeET');

const textRef = "public/txt/vanasonad.txt";
const regtextRef = "public/txt/visits.txt";

//käivitan funktsiooni express() ja annan nimeks app
const app = express();
//määrame renderdusmootori: EJS
app.set('view engine', 'ejs');
//määrame avalikuna kasutatava kataloogi
app.use(express.static('public'));
//määrame vormide sisu parsimise, kui false, siis ainult tekst
app.use(bodyparser.urlencoded({extended: true}));

//marsruudid
app.get('/', (req, res) => {
    const dayNow = dateET.weekday();
    const dateNow = dateET.date(0);
    const timeNow = dateET.time();

    res.render('index', {
        dayNow: dayNow,
        dateNow: dateNow,
        timeNow: timeNow
    });
});

//sisseloginud kasutajate avaleht
app.get('/home', (req, res) => {
	res.render('home')
});

app.get('/vanasona', async (req, res)=>{
	try {
		const data = await fs.readFile(textRef, "utf8");
		let folkWisdom = data.split(";");
		res.render('vanasona', {wisdom: folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))]});
	}
	catch (err) {
		console.log(err);
		res.render('vanasona', {wisdom: 'Kahjuks ei leidnud ühtegi vanasõna!'});
	}
});

app.get('/regvisit', (req, res)=>{
	res.render('regvisit');
});

app.post('/regvisit', async (req, res)=>{
	try {
		await fs.open(regtextRef, 'a');
		await fs.appendFile(regtextRef, req.body.inputName + ';');
		res.render('regvisit');
	}
	catch (err) {
		console.log(err);
		res.render('regvisit');
	}
	
});

//Eesti filmi marsruudid
const eestiFilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestiFilmRouter);

//galeriipiltide üleslaadimine
const galleryPhotoUploadRouter = require('./routes/galleryPhotoUploadRoutes');
app.use('/galleryPhotoUpload', galleryPhotoUploadRouter);

//kasutajakonto loomine
const signupRouter = require('./routes/signupRoutes');
app.use('/signup', signupRouter);

//sisselogimine
const signinRouter = require('./routes/signinRoutes');
app.use('/signin', signinRouter);

//väljalogimine
app.get('/logout', (req, res) => {
	res.redirect('/');
});

app.get('/', async (req, res) => {
    let conn;
    let latestPhoto = null;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        const sql = 'SELECT filename, alttext FROM galleryphotos WHERE id=(SELECT MAX(id) FROM galleryphotos WHERE privacy=? AND deleted IS NULL)';
        const [rows] = await conn.execute(sql, [3]);
        if (rows.length > 0) {
            latestPhoto = rows[0];
        }
    } catch (err) {
        console.log(err);
    } finally {
        if (conn) await conn.end();
    }
    res.render('index', {
        dayNow: dateET.weekday(),
        dateNow: dateET.date(0),
        timeNow: dateET.time(),
        latestPhoto: latestPhoto
    });
});

app.listen(5209);