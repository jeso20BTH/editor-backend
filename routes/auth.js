let express = require('express');
let router = express.Router();

const authModel = require('./../models/authModel');

router.post("/login", async (req, res) => {
    await authModel.login(res, req.body);
});

router.post("/register", async (req, res) => {
    await authModel.register(res, req.body);
});

module.exports = router;
