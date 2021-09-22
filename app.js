const express = require("express");
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const httpServer = require("http").createServer(app);

console.log((process.env.NODE_ENV ==='production') ?
    'https://www.student.bth.se/~jeso20/editor/' :
    "http://localhost:3000");

const io = require("socket.io")(httpServer, {
    cors: {
        origin: 'https://www.student.bth.se',
        // origin: 'http://localhost:3000',
        methods: ["GET", "POST"]
    }
});

function getDate() {
    let today = new Date();
    let y = today.getFullYear();
    let m = today.getMonth();
    let d = today.getDate();
    let h = today.getHours();
    let mm = today.getMinutes();
    let s = today.getSeconds();

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

io.sockets.on('connection', function(socket) {
    let dateString = getDate();

    //Prints to the log, when a user joins.
    console.log(`${dateString} - User connected - ${socket.id}`);

    socket.on('create', function(data) {
        dateString = getDate();

        // Prints when a user joins an room
        console.log(`${dateString} - left room - ${data.oldId}`);

        socket.leave(data.oldId)
        // Prints when a user joins an room
        console.log(`${dateString} - joint room - ${data.newId}`);
        socket.join(data.newId);
    });

    socket.on('title', (data) => {
        socket.to(data._id).emit('title', data.title);
    });

    socket.on('editor', (data) => {
        socket.to(data._id).emit('editor', data.text);
    });
});

const port = process.env.PORT || 1337;

const db = require('./routes/db');



app.use(cors());
// app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    // console.log(req.method);
    // console.log(req.path);
    next();
});

app.use('/db', db);

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use((req, res, next) => {
    let err = new Error("Not Found");

    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
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
});

const server = httpServer.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = server;
