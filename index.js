const express = require('express');
const fs = require('fs').promises;
//moodul POST päringute lahtiharutamiseks, parsimiseks
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks (koos async ehk ootamise osaga)
const mysql = require('mysql2/promise');
//moodul .env keskkonnamuutujate lugemiseks
require('dotenv').config();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const checkLogin = require('./src/checkLogin');
const dateET = require('./src/dateTimeET');

const textRef = "public/txt/vanasonad.txt";
const regtextRef = "public/txt/visits.txt";

//käivitan funktsiooni express() ja annan nimeks app
const app = express();
//võtame kasutusele sessioonihalduri
app.use(session({secret: process.env.SES_SECRET, saveUninitialized: false, resave: true}));
//määrame renderdusmootori: EJS
app.set('view engine', 'ejs');
//määrame avalikuna kasutatava kataloogi
app.use(express.static('public'));
//määrame vormide sisu parsimise, kui false, siis ainult tekst
app.use(bodyparser.urlencoded({extended: true}));

//marsruudid
app.get('/', async (req, res) => {
    const dayNow = dateET.weekday();
    const dateNow = dateET.date(0);
    const timeNow = dateET.time();
	let conn;
	try {
		let sqlReq = "SELECT filename, alttext FROM galleryphotos WHERE id=(SELECT MAX(id) FROM galleryphotos WHERE privacy=? AND deleted IS NULL)";
		const privacy = 3;
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const [rows, fields] = await conn.execute(sqlReq, [privacy]);
		let imgAlt = "Avalik foto";
		if(rows[0].alttext != ""){
			imgAlt = rows[0].alttext;
		}
		res.render('index', {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow, imgFile: "gallery/normal/" + rows[0].filename, imgAlt: imgAlt});
	}
	catch (err) {
		res.render('index', {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow, imgFile: "pic/vp_logo_small.png", imgAlt: "VP logo"});
	}
	finally {
		if(conn){
			await conn.end();
			//console.log("AndmebaasiÃ¼hendus suletud!");
		}
	}
	//res.send('Express.js veeb lÃ¤kski kÃ¤ima!');
	
});


// Ruutingute kaasamine
const addnewsRouter = require('./routes/addnewsRoutes');
app.use('/', addnewsRouter);

// Kontrolleri kaasamine /home jaoks (kui on vaja otse index.js-is)
const newsController = require('./controllers/addnewsControllers');
app.get('/home', checkLogin.isLogin, newsController.getHomeNews);

//väljalogimine
app.get('/logout', (req, res) => {
	//hävitame sessiooni 
	req.session.destroy();
	res.redirect('/');	
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