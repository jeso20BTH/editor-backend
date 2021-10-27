const visual = false;
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema
} = require("graphql");

const RootQueryType = require('./graphql/root');

const schema = new GraphQLSchema({
    query: RootQueryType
});

const express = require("express");
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const httpServer = require("http").createServer(app);

const userModel = require('./models/userModel');

const io = require("socket.io")(httpServer, {
    cors: {
        origin: 'https://www.student.bth.se',
        'Access-Control-Allow-Origin': 'https://www.student.bth.se',
        // origin: 'http://localhost:3000',
        methods: ["GET", "POST", "PUT"]
    }
});

io.sockets.on('connection', function(socket) {
    let dateString = userModel.getDate();

    //Prints to the log, when a user joins.
    console.log(`${dateString} - User connected - ${socket.id}`);

    socket.on('create', function(data) {
        dateString = userModel.getDate();

        // Prints when a user joins an room
        console.log(`${dateString} - left room - ${data.oldId}`);

        socket.leave(data.oldId);
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
const auth = require('./routes/auth');
const pdf = require('./routes/pdf');
const mail = require('./routes/mail');
const code = require('./routes/code');
const authModel = require('./models/authModel')

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    next();
});



app.use('/db', db);
app.use('/auth', auth);
app.use('/pdf', pdf);
app.use('/mail', mail);
app.use('/code', code)

app.use(authModel.verifyToken);
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: visual,
}));



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

const server = httpServer;

if (process.env.NODE_ENV !== 'test') {
    server.listen(port, () => console.log(`API is listening on port ${port}!`));
}

module.exports = server;
