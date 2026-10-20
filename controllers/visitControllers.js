const fs = require("fs").promises;
const dateET = require("../src/dateTimeET");

const regtextRef = "public/txt/visits.txt";

const regvisit = (req, res) => {
    res.render("regvisit");
};

const regvisitPost = async (req, res) => {

    try {

        const dateNow = dateET.date(0);
        const timeNow = dateET.time();

        await fs.open(regtextRef, "a");

        await fs.appendFile(
            regtextRef,
            req.body.inputName + "," + dateNow + "," + timeNow + ";"
        );

        res.render("regvisit");

    } catch(err){

        console.log(err);
        res.render("regvisit");
    }
};

const lastvisit = async (req, res) => {

    try {

        const data = await fs.readFile(regtextRef, "utf8");

        let visits = data.split(";");

        let lastVisit = visits[visits.length - 2];

        let visitData = lastVisit.split(",");

        res.render("lastvisit", {
            name: visitData[0],
            date: visitData[1],
            time: visitData[2]
        });

    } catch(err){

        console.log(err);

        res.render("lastvisit", {
            name: "andmed puuduvad",
            date: "-",
            time: "-"
        });
    }
};

module.exports = {
    regvisit,
    regvisitPost,
    lastvisit
};