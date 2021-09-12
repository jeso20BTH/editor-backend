let express = require('express');
let router = express.Router();

let database = require('./../db/database')

router.get("/", async (req, res) => {
    const resultSet = await database.findAll();

    res.json(resultSet);
})

router.post("/", async (req, res) => {
    let that = this;
        let today = new Date();
        let offset = today.getTimezoneOffset();
        console.log(offset);
        let y = today.getFullYear();
        let m = today.getMonth();

        if (m < 10) {
            m = `0${m}`
        }
        let d = today.getDate();
        if (d < 10) {
            d = `0${d}`
        }

        let h = today.getHours();
        if (h < 10) {
            h = `0${h}`
        }
        let mm = today.getMinutes();
        if (mm < 10) {
            mm = `0${mm}`
        }
        let s = today.getSeconds();
        if (s < 10) {
            s = `0${s}`
        }

    let dateString = `${y}-${m}-${d} ${h}:${mm}:${s}`;
    let doc = {
        name: (req.body.name && req.body.name.length > 0) ? req.body.name : "New document",
        html: req.body.html,
        date: dateString
    }

    result = await database.addOne(doc);

    if (result.acknowledged) {
        return res.status(201).json({_id: result.insertedId});
    }
})

router.put("/", async (req, res) => {
    let today = new Date();
    let offset = today.getTimezoneOffset();
    console.log(offset);
    let y = today.getFullYear();
    let m = today.getMonth();

    if (m < 10) {
        m = `0${m}`
    }
    let d = today.getDate();
    if (d < 10) {
        d = `0${d}`
    }

    let h = today.getHours();
    if (h < 10) {
        h = `0${h}`
    }
    let mm = today.getMinutes();
    if (mm < 10) {
        mm = `0${mm}`
    }
    let s = today.getSeconds();
    if (s < 10) {
        s = `0${s}`
    }

    let dateString = `${y}-${m}-${d} ${h}:${mm}:${s}`;
    let doc = {
        name: req.body.name,
        html: req.body.html,
        date: dateString
    };

    let _id = req.body._id;

    result = await database.updateOneObject(_id, doc);

    if (result.acknowledged) {
        return res.status(204).send();
    }
})

router.delete("/", async (req, res) => {
    let _id = req.body._id;

    result = await database.deleteOneObject(_id);

    if (result.ok) {
        return res.status(204).send();
    }
})

router.get("/reset", async (req, res) => {
    await database.resetDb();

    res.redirect('/db')
})

module.exports = router;
