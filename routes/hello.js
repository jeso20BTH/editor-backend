let express = require('express');
let router = express.Router();

router.get("/:msg", (req, res) => {
    const data = {
        data: {
            msg: req.params.msg
        }
    };

    res.json(data);
})

module.exports = router;
