let express = require('express');
let router = express.Router();

let authModel = require('./../models/authModel');
let mailModel = require('./../models/mailModel');
router.post("/",
    (req, res, next) => authModel.verifyToken(req, res, next),
    async (req, res) => await mailModel.sendMail(req, res)
);

// router.get('/', (req, res) => pdfModel.sendPDF(req, res));

module.exports = router;
