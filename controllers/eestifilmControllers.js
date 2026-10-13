const mysql = require('mysql2/promise');

//@desc home page for Estonian Film section
//@route GET /eestifilm
//@access public

//app.get("/eestifilm", (req, res)=>{
const eestifilm = (req, res) => {
    res.render("eestifilm"); 
};

//@desc home page for people involved in Estonian Film industry
//@route GET /eestifilm/inimesed
//@access public

//app.get("/eestifilm/inimesed", async (req, res)=>{
const inimesed = async (req, res) => {
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
};

//@desc page for adding people involved in Estonian Film industry
//@route GET /eestifilm/inimesed_lisa
//@access public

//app.get("/eestifilm/inimesed_lisa", async (req, res)=>{
const inimesedAdd = (req, res) => {
res.render("eestifilminimesed_lisa", { 
	notice: "Ootan sisestust!",
	firstNameInput: "",
    lastNameInput: "",
    bornInput: "",
    deceasedInput: ""
	});
};

//@desc page for adding people involved in Estonian Film industry
//@route POST /eestifilm/inimesed_lisa
//@access public

//app.post("/eestifilm/inimesed_lisa", async (req, res)=>{
const inimesedAddPost = async (req, res) => {
	const bornDate = new Date(req.body.bornInput);
	const timeNow = new Date();
	
	// console.log(req.body);
	//kontrollime andmeid
	//sisestatud sünnikuupäev (tekst) teisendada kuupäevaks
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || isNaN(bornDate.getTime()) || bornDate > timeNow) {
		console.log("Andmed pole korrektsed!");
		return res.render("eestifilminimesed_lisa", {
			notice: "Andmed pole korrektsed", 
			firstNameInput: req.body.firstNameInput,
			lastNameInput: req.body.lastNameInput,
			bornInput: req.body.bornInput,
			deceasedInput: req.body.deceasedInput
		});
	}
	let deceasedDate = null;
	if(req.body.deceasedInput != "") {
		const deceasedObj = new Date(req.body.deceasedInput);
		if(isNaN(deceasedObj.getTime()) || deceasedObj > timeNow || deceasedObj < bornDate) {
			return res.render("eestifilminimesed_lisa", { 
			notice: "Surmakuupäev pole korrektne!",	
			firstNameInput: req.body.firstNameInput,
			lastNameInput: req.body.lastNameInput,
			bornInput: req.body.bornInput,
			deceasedInput: req.body.deceasedInput
			});
		}
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
		res.render("eestifilminimesed_lisa", {notice: req.body.firstNameInput + " " + req.body.lastNameInput + " Andmebaasi lisatud!",
				firstNameInput: "",
				lastNameInput: "",
				bornInput: "",
				deceasedInput: ""
			});
		}
	
	catch (err) {
		console.log("Viga andmebaasiga suhtlemisel: " + err);
		res.render("eestifilminimesed_lisa", {
				notice: "Tekkis viga, midagi ei leitud!",
				firstNameInput: req.body.firstNameInput,
				lastNameInput: req.body.lastNameInput,
				bornInput: req.body.bornInput,
				deceasedInput: req.body.deceasedInput
		});
	}
	finally {
		if(conn){
			await conn.end();	
		}
	}
};

//@desc page for list Estonian genres
//@route GET /eestifilm/zanrid
//@access public

//app.get("/zanrid", (req, res) => {
    res.render("zanrid", {
        notice: "Ootan sisestust!",
        genreNameValue: null,
        descriptionValue: null   
	});
app.post("/zanrid", async (req, res) => {

    if(!req.body.genreNameInput || !req.body.descriptionInput){
        return res.render("zanrid", {
            notice: "Kõik väljad peavad olema täidetud!",
            genreNameValue: req.body.genreNameInput,
            descriptionValue: req.body.descriptionInput
        });
    }

    let conn;
    try{
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        let sqlReq = "INSERT INTO genre (genre_name, description) VALUES (?, ?)";

        await conn.execute(sqlReq, [
            req.body.genreNameInput,
            req.body.descriptionInput
        ]);

        res.render("zanrid", {
            notice: "Žanr lisatud!",
            genreNameValue: null,
            descriptionValue: null
        });

    } catch(err){
        console.log(err);

        res.render("zanrid", {
            notice: "Andmebaasi viga!",
            genreNameValue: req.body.genreNameInput,
            descriptionValue: req.body.descriptionInput
        });

    } finally{
        if(conn){
            await conn.end();
        }
    }
});

//@desc page for adding Estonian genres
//@route GET /eestifilm/zanrid_add
//@access public


//@desc page listing professions related to film
//@route GET /eestifilm/ametid
//@access public
const ametid = async (req, res)=>{
    console.log('Andmebaasi server on: ' + process.env.DB_HOST);
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: 'if26_inga_petuhhov_ID'
        });
        const sqlReq = 'SELECT * FROM profession ORDER by id';
        const [sqlRes] = await conn.execute(sqlReq);
        //console.log(sqlRes);
        res.render('eestifilmametid', {professionList: sqlRes});
    }
    catch (err){
        console.log('Viga andmebaasist lugemisel:' + err);
        res.render('eestifilmametid', {professionList: []})
    }
    finally {
        if(conn) {
            await conn.end();
        }
    }

};

//@desc page for adding professions related to film
//@route GET /eestifilm/ametid_add
//@access public

const ametidAdd = (req, res)=>{
    res.render('eestifilmametid_add', {
        notice: 'Ootan sisestust!',
        title: null,
        description: null,

    });
};

//@desc page for adding professions related to film
//@route POST /eestifilm/ametid_add
//@access public

const ametidAddPost = async (req, res) => {
    const { title, description} = req.body;

    // Abifunktsioon vormi uuesti kuvamiseks
    const showForm = (notice, clear = false) => {
        res.render('eestifilmametid_add', {
            notice: notice,
            title: clear ? null : title,
            description: clear ? null : description

        });
    };
    if (
        !title?.trim() ||
        !description?.trim()

    ) {
        return showForm('Ootan sisestust!');
    }
    let conn;

    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: 'if26_inga_petuhhov_ID'
        });

        const sqlReq = 'INSERT INTO profession (title, description) VALUES (?, ?)';

        await conn.execute(sqlReq, [
            title.trim(),
            description.trim()
        ]);

        // Eduka salvestamise jÃ¤rel tÃ¼hjendame vormi
        showForm('Andmed salvestati! Ootan uut sisestust!', true);

    } catch (err) {
        console.log('Viga andmebaasiga suhtlemisel: ' + err);
        showForm('Tekkis viga, andmeid ei salvestatud!');
    } finally {
        if (conn) {
            await conn.end();
        }
    }
};


module.exports = {
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddPost,
	zanrid,
	zanridAdd,
	zanridAddPost,
	ametid,
	ametidAdd,
	ametidAddPost
}