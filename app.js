const express = require("express");
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const port = 1337;

const index = require('./routes/index');
const hello = require('./routes/hello');

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(req.method);
    console.log(req.path);
    next();
})

app.use('/', index);
app.use('/hello', hello)

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use((req, res, next) => {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
})

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    res.status(err.status || 500).json({
        "errors": [
            {
                "status": err.status,
                "title": err.title,
                "details": err.message
            }
        ]
    });
})







// Start up server
app.listen(port, () => console.log(`Example API listening on port ${port}!`));
