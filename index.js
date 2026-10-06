const express = require("express");
const dateET = require("./src/dateTimeET");
const fs = require('fs').promises;
//moodul POST päringute lahtiharutamiseks, parsimiseks
const bodyparser = require("body-parser");

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

app.listen(5209);