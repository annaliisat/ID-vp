const express = require("express");
const fs = require('fs').promises;
//moodul POST päringute lahtiharutamiseks, parsimiseks
const bodyparser = require("body-parser");
//moodul andmebaasiga suhtlemiseks (koos sync ehk ootamise osaga)
const mysql = require("mysql2/promise");
//moodul .env keskkonna muutujate lugemiseks
require("dotenv").config();

const dateET = require("./src/dateTimeET");

const textRef = "public/txt/vanasonad.txt";
const regtextRef = "public/txt/visits.txt";

// käivitan funktsiooni express() ja annan nimeks app 
const app = express();
// määrame renderdusmootori: EJS
app.set("view engine", "ejs");
//määrame avalikuna kasutatava kataloogi
app.use(express.static("public"));
//määrame vormide sisu parsimiseks
app.use(bodyparser.urlencoded({extended: false}));

// marsruudid
app.get("/", (req, res)=>{
	const dayNow = dateET.weekday();
	const dateNow = dateET.date(0);
	const timeNow = dateET.time();
	//res.send("Express.js veeb läkski käima!");
	res.render("index", {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow});
});

app.get("/vanasona", async (req, res)=>{
	try {
		const data = await fs.readFile(textRef, "utf8");
		let folkWisdom = data.split(";");
		res.render("vanasona", {wisdom: folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))]});
	}
	catch (err) {
		console.log(err);
		res.render("vanasona", {wisdom: "Kahjuks ei leidnud ühtegi vanasõna!"});
	}
});

app.get("/regvisit", async (req, res)=>{
	res.render("regvisit");
});
 
app.post("/regvisit", async (req, res)=>{
		try {
				const dateNow = dateET.date(0);
				const timeNow = dateET.time();
				await fs.open(regtextRef, "a");
				await fs.appendFile(
						regtextRef,
						req.body.inputName + "," + dateNow + "," + timeNow + ";"
				);
 
			res.render("regvisit");
		}
		catch (err) {
			console.log(err);
			res.render("regvisit");
		}
	
});

app.get("/lastvisit", async (req, res) =>{
		try {
			const data = await fs.readFile(regtextRef, "utf8");
			let visits = data.split(";");
			// viimane element on tühi
			let lastVisit = visits[visits.length - 2];

			let visitData = lastVisit.split(",");

			res.render("lastvisit", {
					name: visitData[0],
					date: visitData[1],
					time: visitData[2]
				});
		}
		catch(err){
			console.log(err);

			res.render("lastvisit", {
				name: "andmed puuduvad",
				date: "-",
				time: "-"
			});
		}
});

app.get("/minust", (req, res)=>{
    res.render("minust");
});

app.get("/eestifilm", (req, res)=>{
    res.render("eestifilm");
});

app.get("/eestifilm/inimesed", async (req, res)=>{
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		//defineerime SQL päringu
		let sqlReq = "SELECT * FROM person";
		const [sqlRes] = await conn.execute(sqlReq);
		//console.log(sqlRes);
		 res.render("eestifilminimesed", {personList: sqlRes});
	} 
	catch (err) {
		console.log("Andmebaasiga suhtlemise viga: " + err);
		 res.render("eestifilminimesed", {personList: []});
	}
	finally {
		if(conn){
			await conn.end();	
		}
	}
});

app.get("/eestifilm/inimesed_lisa", async (req, res)=>{
	res.render("eestifilminimesed_lisa", {notice: "Ootan sisestust!"});
});

app.post("/eestifilm/inimesed_lisa", async (req, res)=>{
	console.log(req.body);
	//kontrollime andmeid
	//sisestatud sünnikuupäev (tekst) teisendada kuupäevaks
	const bornDate = new Date(req.body.bornInput);
	const timeNow = new Date();
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || isNaN(bornDate.getTime()) || bornDate > timeNow) {
		console.log("Andmed pole korrektsed!");
		return res.render("eestifilminimesed_lisa", {notice: "Andmed pole korrektsed"});
	}
	let deceasedDate = null;
	if(req.body.deceasedInput != "") {
		deceasedDate = req.body.deceasedInput;
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = "INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)";
		await conn.execute(sqlReq, [
			req.body.firstNameInput,
			req.body.lastNameInput,
			req.body.bornInput,
			deceasedDate
		]);
		res.render("eestifilminimesed_lisa", {notice: req.body.firstNameInput + " " + req.body.lastNameInput + " Andmebaasi lisatud!"});
	}
	catch (err) {
		console.log("Viga andmebaasiga suhtlemisel: " + err);
		res.render("eestifilminimesed_lisa", {notice: "Tekkis viga, midagi ei leitud!"});
	}
	finally {
		if(conn){
			await conn.end();	
		}
	}
});
	
	app.listen(5209);