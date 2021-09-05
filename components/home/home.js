const express = require('express');
const router = express.Router();

router.use(function timelog(req,res, next) {
    console.log("Time: ", Date.now());
    next();
});

router.get('/', async (req, res) => {
    res.send({info: "Olá Blue"});
});

module.exports = router;