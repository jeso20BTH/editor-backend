let userModel = require('./userModel');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

let config;

try {
    config = require('./../db/config.json');
} catch (e) {
    console.log(e);
}

const secret = process.env.JWT_SECRET || config.secret;

const authModel = {
    login: async function(res, data) {
        let filter = {email: data.email};
        let user = await userModel.findOneByFilter(filter);

        return authModel.decryptPassword(res, data.password, user);
    },
    register: async function(res, data) {
        let emailExists = await authModel.checkIfEmailExists(data.email);

        if (!emailExists) {
            console.log('Email okay');
            let password = authModel.hashifyPassword(res, data);

            console.log(password);
        } else {
            console.log('Email already registered');
        }
    },
    decryptPassword: function(res, plainPassword, user) {
        bcrypt.compare(plainPassword, user.password, function(err, authentificated) {
            if (authentificated) {
                let payload = {_id: user._id};
                let token = jwt.sign(payload, secret, {expiresIn: '1h'});

                return res.json({
                    message: 'Successful login!',
                    token: token,
                    userId: user._id,
                    name: user.name,
                    documents: user.documents,
                    success: true
                });
            } else {
                return res.status(201).json({
                    message: 'Unsuccessful login!'
                });
            }
        });
    },
    checkIfEmailExists: async function(email) {
        let filter = {email: email};
        let user = await userModel.findOneByFilter(filter);

        if (user) {
            return true;
        } else {
            return false;
        }
    },
    hashifyPassword: async function(res, data) {
        const saltRounds = 10;

        bcrypt.hash(data.password, saltRounds, async function(err, hash) {
            let createdUser = await userModel.addOneUser({
                name: data.name,
                email: data.email,
                password: hash,
                documents: [],
                allowed_user: []
            });

            console.log(createdUser);

            if (createdUser) {
                let payload = {_id: createdUser.insertedId};
                let token = jwt.sign(payload, config.secret, {expiresIn: '1h'});

                return res.json({
                    message: 'Successful register!',
                    token: token,
                    userId: createdUser.insertedId,
                    name: data.name,
                    documents: [],
                    success: true
                });
            }
        });
    },
    verifyToken: function(req, res, next) {
        const token = req.headers['x-access-token'];

        jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                console.log('*error');
                return res.status(500).json({
                    message: "Error"
                });
            }

            console.log(decoded);

            // Valid token send on the request
            next();
        });
    }
};

module.exports = authModel;