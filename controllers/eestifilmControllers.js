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
// Žanrite nimekiri
const zanrid = async (req, res) => {

    let conn;

    try {

        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const [sqlRes] = await conn.execute(
            "SELECT * FROM genre"
        );

        res.render("zanrid", {
            notice: "Ootan sisestust!",
			genreNameValue: "",
			descriptionValue: "",
			genreList: sqlRes
        });

    } catch(err){

        console.log(err);

        res.render("zanrid", {
            notice: "Andmebaasi viga!",
			genreNameValue: "",
			descriptionValue: "",
			genreList: []
        });

    } finally {

        if(conn){
            await conn.end();
        }
    }
};

// Žanri lisamise vorm
const zanridAdd = (req, res) => {

    res.render("zanrid", {
        notice: "Ootan sisestust!",
        genreNameValue: "",
        descriptionValue: ""
    });

};

// Žanri salvestamine
const zanridAddPost = async (req, res) => {

    if(
        !req.body.genreNameValue ||
        !req.body.descriptionValue
    ){

        return res.render("zanrid", {
            notice: "Kõik väljad peavad olema täidetud!",
            genreNameValue: req.body.genreNameInput,
            descriptionValue: req.body.descriptionInput
        });
    }

    let conn;

    try {

        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const sqlReq =
            "INSERT INTO genre (name, description) VALUES (?, ?)";

        await conn.execute(sqlReq, [
            req.body.genreNameValue,
            req.body.descriptionValue
        ]);

        res.render("zanrid", {
            notice: "Žanr lisatud!",
            genreNameValue: "",
            descriptionValue: ""
        });

    } catch(err){

        console.log(err);

        res.render("zanrid", {
            notice: "Andmebaasi viga!",
            genreNameValue: req.body.genreNameInput,
            descriptionValue: req.body.descriptionInput
        });

    } finally {

        if(conn){
            await conn.end();
        }

    }

};

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
        res.render('ametid', {
			notice: "Ootan sisestust!",
			professionNameValue: "",
			descriptionValue: "",
			professionList: sqlRes
			});
    }
    catch (err){
        console.log('Viga andmebaasist lugemisel:' + err);
        res.render('ametid', {
		notice: "Andmebaasi viga!",
		professionNameValue: "",
		descriptionValue: "",
		professionList: []
	});
   
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
    res.render('ametid', {
        notice: 'Ootan sisestust!',
        professionNameValue: '',
        descriptionValue: ''
    });
};

//@desc page for adding professions related to film
//@route POST /eestifilm/ametid_add
//@access public

const ametidAddPost = async (req, res) => {
    const { title, description} = req.body;

    // Abifunktsioon vormi uuesti kuvamiseks
    const showForm = (notice, clear = false) => {
        res.render('ametid', {
            notice: notice,
			professionNameValue: clear ? '' : title,
			descriptionValue: clear ? '' : description

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

const seosed = async (req, res) => {

    let conn;

    try {

        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const [people] = await conn.execute(
            "SELECT id, first_name, last_name FROM person"
        );

        const [movies] = await conn.execute(
            "SELECT id, title FROM movie"
        );

        const [professions] = await conn.execute(
            "SELECT id, title FROM profession"
        );

        res.render("seosed", {
            notice: "Vali andmed",
            people,
            movies,
            professions
        });

    } catch(err){

        console.log(err);

        res.render("seosed", {
            notice: "Andmete lugemisel tekkis viga",
            people: [],
            movies: [],
            professions: []
        });
    }

    finally{
        if(conn){
            await conn.end();
        }
    }
};

const seosedPost = async (req, res) => {

    let conn;

    try {

        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const {
            personId,
            movieId,
            professionId,
            roleName
        } = req.body;

        const [exists] = await conn.execute(
            `SELECT id
             FROM person_in_movie
             WHERE person_id = ?
             AND movie_id = ?
             AND profession_id = ?
             AND IFNULL(character_name,'') = IFNULL(?, '')`,
            [
                personId,
                movieId,
                professionId,
                roleName
            ]
        );

        if(exists.length > 0){

            const [people] =
                await conn.execute(
                    "SELECT id, first_name, last_name FROM person"
                );

            const [movies] =
                await conn.execute(
                    "SELECT id, title FROM movie"
                );

            const [professions] =
                await conn.execute(
                    "SELECT id, title FROM profession"
                );

            return res.render("seosed", {
                notice: "Selline seos on juba olemas!",
                people,
                movies,
                professions
            });

        }

        await conn.execute(
            `INSERT INTO person_in_movie
            (person_id, movie_id, profession_id, character_name)
            VALUES (?, ?, ?, ?)`,
            [
                personId,
                movieId,
                professionId,
                roleName || null
            ]
        );

        res.redirect("/eestifilm/seosed_list");

    } catch(err){

        console.log(err);

    } finally {

        if(conn){
            await conn.end();
        }

    }

};

const seosedList = async (req, res) => {

    let conn;

    try {

        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const sqlReq = `
            SELECT
                CONCAT(
                    p.first_name,
                    ' ',
                    p.last_name
                ) AS person,
                m.title AS movie,
                pr.title AS profession,
                character_name
            FROM person_in_movie
            JOIN person p
                ON person_id = p.id
            JOIN movie m
                ON movie_id = m.id
            JOIN profession pr
                ON profession_id = pr.id
            ORDER BY m.title
        `;

        const [sqlRes] =
            await conn.execute(sqlReq);

        res.render("seosed_list", {
            seosed: sqlRes
        });

    } catch(err){

        console.log(err);

        res.render("seosed_list", {
            seosed: []
        });

    } finally {

        if(conn){
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
	ametidAddPost,
	seosed,
    seosedPost,
    seosedList
};