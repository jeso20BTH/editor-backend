let express = require('express');
let router = express.Router();

let database = require('./../db/database')

router.get("/", async (req, res) => {
    const resultSet = await database.findAll();

    res.json(resultSet);
})

router.post("/", async (req, res) => {
    console.log(req.body);
    console.log(res.body);
    let doc = {
        name: req.body.name,
        html: req.body.html
    }

    result = await database.addOne(doc);

    if (result.acknowledged) {
        return res.status(201).send(`Added an object with id ${result.insertedId}`);
    }
})

router.put("/", async (req, res) => {
    console.log(req.body);
    console.log(res.body);
    let doc = {
        name: req.body.name,
        html: req.body.html
    }

    result = await database.addOne(doc);

    if (result.acknowledged) {
        return res.status(204).send();
    }
})



router.get("/reset", async (req, res) => {
    await database.resetDb();

    res.redirect('/db')
})

module.exports = router;
