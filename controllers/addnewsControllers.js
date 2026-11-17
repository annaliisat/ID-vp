const pool = require('../src/database');

//uudise lisamise vorm (arvutab 7 päeva ette aegumiskuupäeva
exports.getAddNews = (req, res) => {
	const today = new Date();
	today.setDate(today.getDate() + 7);
	const defaultExpireDate = today.toISOString().split('T')[0];
	res.render('news', { defaultExpireDate});	
};

//salvestab uue uudise (koos pildi ja alt-tekstiga)
exports.postAddNewsForm = async (req, res) => {
	try {
		const { titleInput, contentInput, expireInput, alttext } = req.body;
		const userid = req.session.userId; //sisselogitud kasutaja id
		const filename = req.file ? req.file.filename : null; //pildi failinimi

		//kas kohustuslikud väljad on täidetud
		if (!titleInput || !contentInput || !expireInput) {
		return res.status(400).send
		}
	
		const query = 'INSERT INTO news (news_title, news_text, expire_date, userid, filename, alttext) VALUES (?, ?, ?, ?, ?, ?)';
	
		await pool.query(query, [titleInput, contentInput, expireInput, userid, filename, alttext]);
	
		//pärast salvestamist suuname kasutaja uudiste lehele (või avalehele)
		res.redirect('/news'),
	} catch (err) { 
		console.error(err),
		res.status(500).send('Serveri viga uudise salvestamisel');
	}
};

//kuvab kõik kehtivad ja kustutamata uudised
exports.getAddNews = async (req, res) => {
	try {
		const query = `SELECT n.news_title, n.news_text, n.created, n.filename, n.alttext, u.firstname, u.lastname 
			FROM news n 
            JOIN users u ON n.userid = u.id 
            WHERE n.expire_date >= CURDATE() AND n.deleted IS NULL 
            ORDER BY n.id DESC
        `;
		const [rows] = await pool.query(query);
		
		//newsList.ejs
		res.render('newsList', { newsList: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Serveri viga uudiste laadimisel');
    }
};

//kuvab värskeima uudise /home lehele
exports.getHomeNews = async (req, res) => {
    try {
        const query = `
            SELECT n.news_title, n.news_text, n.created, n.filename, n.alttext, u.firstname, u.lastname 
            FROM news n 
            JOIN users u ON n.userid = u.id 
            WHERE n.expire_date >= CURDATE() AND n.deleted IS NULL 
            ORDER BY n.id DESC 
            LIMIT 1
        `;
        const [rows] = await pool.query(query);
        const latestNews = rows.length > 0 ? rows[0] : null;

        res.render('home', { latestNews });
    } catch (err) {
        console.error(err);
        res.status(500).send('Serveri viga avalehe laadimisel');
    }
};
      
module.exports = {
	addnews
}