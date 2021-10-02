let express = require('express');
let router = express.Router();

let authModel = require('./../models/authModel');
let userModel = require('./../models/userModel');

router.post("/",
    (req, res, next) => authModel.verifyToken(req, res, next),
    async (req, res) => await userModel.findAllUsers(req, res));

router.post("/document",
    (req, res, next) => authModel.verifyToken(req, res, next),
    async (req, res) => await userModel.findAllDocumentsForUser(req, res));

router.post("/document/add",
    (req, res, next) => authModel.verifyToken(req, res, next),
    async (req, res) => await userModel.addOneDocument(req, res));

router.put("/document/update",
    (req, res, next) => authModel.verifyToken(req, res, next),
    async (req, res) => await userModel.updateOneDocument(req, res));

router.delete("/document/delete",
    (req, res, next) => authModel.verifyToken(req, res, next),
    async (req, res) => await userModel.deleteOneDocument(req, res));

router.put("/",
    (req, res, next) => authModel.verifyToken(req, res, next),
    async (req, res) => await userModel.resetData(req, res));

module.exports = router;
