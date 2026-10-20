const express = require("express");
const router = express.Router();

const {
    regvisit,
    regvisitPost,
    lastvisit
} = require("../controllers/visitControllers");

router.route("/").get(lastvisit);

router.route("/register")
    .get(regvisit)
    .post(regvisitPost);

module.exports = router;