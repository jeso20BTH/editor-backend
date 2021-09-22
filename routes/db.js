let express = require('express');
let router = express.Router();

let database = require('./../db/database');

function getDate() {
    let today = new Date();
    let offset = today.getTimezoneOffset();
    let y = today.getFullYear();
    let m = today.getMonth();
    let d = today.getDate();
    let h = today.getHours();
    let mm = today.getMinutes();
    let s = today.getSeconds();

    h += (-offset/60);

    if (m < 10) {
        m = `0${m}`;
    }

    if (d < 10) {
        d = `0${d}`;
    }

    if (h < 10) {
        h = `0${h}`;
    }

    if (mm < 10) {
        mm = `0${mm}`;
    }

    if (s < 10) {
        s = `0${s}`;
    }

    return `${y}-${m}-${d} ${h}:${mm}:${s}`;
}

router.get("/", async (req, res) => {
    const resultSet = await database.findAll();

    res.json(resultSet);
});

router.post("/", async (req, res) => {
    let dateString = getDate();

    let doc = {
        name: (req.body.name && req.body.name.length > 0) ? req.body.name : "New document",
        html: req.body.html,
        date: dateString
    };

    let result = await database.addOne(doc);

    if (result.acknowledged) {
        return res.status(201).json({_id: result.insertedId});
    }
});

router.put("/", async (req, res) => {
    let dateString = getDate();
    let doc = {
        name: req.body.name,
        html: req.body.html,
        date: dateString
    };

    let _id = req.body._id;

    let result = await database.updateOneObject(_id, doc);

    if (result.acknowledged) {
        return res.status(204).send();
    }
});

router.delete("/", async (req, res) => {
    let _id = req.body._id;

    let result = await database.deleteOneObject(_id);

    if (result.ok) {
        return res.status(204).send();
    }
});

router.get("/reset", async (req, res) => {
    await database.resetDb();

    res.redirect('/db');
});

module.exports = router;
