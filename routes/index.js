let express = require('express');
let router = express.Router();
// Add a route
router.get("/", (req, res) => {
    const data = {
        data: {
            msg: "Got a GET request"
        }
    };

    res.json(data);
});

router.post("/", (req, res) => {
    res.status(201).json(
        {
            data: {
                msg: "Got a POST request"
            }
        }
    );
});

router.put("/", (req, res) => {
    res.status(204).send();
});

router.delete("/", (req, res) => {
    res.status(204).send();
});

module.exports = router;
