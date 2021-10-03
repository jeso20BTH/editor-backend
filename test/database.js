/* global it describe beforeEach */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
// const HTMLParser = require('node-html-parser');

const server = require('../app.js');

let shoud = chai.should();
let expect = chai.expect;

const database = require("../db/database.js");
const collectionName = "users";



chai.use(chaiHttp);

describe('Test the routes for the database.', () => {
    let token;
    let userId;
    let documentId;

    describe('User handeling', () => {
        before(() => {
            return new Promise(async (resolve) => {
                const db = await database.getDb();

                db.db.listCollections(
                    { name: collectionName }
                )
                    .next()
                    .then(async function(info) {
                        if (info) {
                            await db.collection.drop();
                        }
                    })
                    .catch(function(err) {
                        console.error(err);
                    })
                    .finally(async function() {
                        await db.client.close();
                        resolve();
                    });
            });
        });

        it('Added user', async () => {
            let user = {
                email: 'test@test.se',
                name: "test",
                password: "test"
            };

            let res = await chai.request(server)
                .post("/auth/register")
                .send(user)

            res.should.have.status(201);
            res.body.token.should.not.equal(null);
            res.body.message.should.equal('Successful register!');

        });

        it('Add same user twice', async () => {
            let user = {
                email: 'test@test.se',
                name: "test",
                password: "test"
            };

            res = await chai.request(server)
                .post("/auth/register")
                .send(user)

            res.should.have.status(500);
            res.body.error.should.equal('user already registered!');
        });

        it('Added second unique user', async () => {
            let user = {
                email: 'testa@test.se',
                name: "testa",
                password: "testa"
            };

            let res = await chai.request(server)
                .post("/auth/register")
                .send(user)

            res.should.have.status(201);
            res.body.token.should.not.equal(null);
            res.body.message.should.equal('Successful register!');

        });


        it('Login an user successfully', async () => {
            let user = {
                email: 'test@test.se',
                password: "test"
            };

            let res = await chai.request(server)
                .post("/auth/login")
                .send(user)

            res.should.have.status(200);
            res.body.token.should.not.equal(null);


            token = res.body.token;
            userId = res.body.userId;
            // console.log(res.body);


        });

        it('Login an user failed', async () => {
            let user = {
                email: 'test@test.se',
                password: "tes"
            };

            let res = await chai.request(server)
                .post("/auth/login")
                .send(user)

            res.should.have.status(500);
            res.body.message.should.equal('Unsuccessful login!');


        });

        describe('Document handeling', () => {
            it('Get documents no documents document', async () => {
                user = {
                    _id: userId
                }

                res = await chai.request(server)
                    .post("/db/document")
                    .set('x-access-token', token)
                    .send(user)

                res.should.have.status(200);
                res.body.owner.should.be.an("array");
                res.body.access.should.be.an("array");
                res.body.owner.length.should.be.equal(0);
                res.body.access.length.should.be.equal(0);
            });

            it('Add one document', async () => {
                let doc = {
                    name: 'Test',
                    html: '<p>Test</p>',
                    _id: userId
                }
                res = await chai.request(server)
                    .post("/db/document/add")
                    .set('x-access-token', token)
                    .send(doc)

                documentId = res.body._id

                res.should.have.status(201);
                res.body.message.should.be.equal('New document added');
                res.body._id.length.should.not.be.equal(0);
            });

            it('Get documents after adding one for owner', async () => {
                user = {
                    _id: userId
                }

                res = await chai.request(server)
                    .post("/db/document")
                    .set('x-access-token', token)
                    .send(user)

                res.should.have.status(200);
                res.body.owner.should.be.an("array");
                res.body.access.should.be.an("array");
                res.body.owner.length.should.be.equal(1);
                res.body.access.length.should.be.equal(0);
                res.body.owner[0].name.should.be.equal('Test');
                res.body.owner[0].html.should.be.equal('<p>Test</p>');
                res.body.owner[0].allowed_users.should.be.an("array");
                res.body.owner[0].allowed_users.length.should.be.equal(0);
                res.body.owner[0].date.length.should.be.equal(19);
            });

            it('Update document', async () => {
                let doc = {
                    name: 'New test',
                    html: '<p>New test</p>',
                    _id: userId,
                    documentId: documentId
                }
                let res = await chai.request(server)
                    .put("/db/document/update")
                    .set('x-access-token', token)
                    .send(doc)


                res.should.have.status(204);
            });

            it('Get documents after update', async () => {
                user = {
                    _id: userId
                }

                res = await chai.request(server)
                    .post("/db/document")
                    .set('x-access-token', token)
                    .send(user)

                res.should.have.status(200);
                res.body.owner.should.be.an("array");
                res.body.access.should.be.an("array");
                res.body.owner.length.should.be.equal(1);
                res.body.access.length.should.be.equal(0);
                res.body.owner[0].name.should.be.equal('New test');
                res.body.owner[0].html.should.be.equal('<p>New test</p>');
                res.body.owner[0].allowed_users.should.be.an("array");
                res.body.owner[0].allowed_users.length.should.be.equal(0);
                res.body.owner[0].date.length.should.be.equal(19);
            });

            it('Give another user access to a document', async () => {
                let doc = {
                    _id: userId,
                    documentId: documentId,
                    allowed_users: 'testa@test.se'
                }

                let res = await chai.request(server)
                    .put("/db/document/update")
                    .set('x-access-token', token)
                    .send(doc)


                res.should.have.status(204);
            });

            it('Get documents after allowed access', async () => {
                let user = {
                    _id: userId
                }

                let res = await chai.request(server)
                    .post("/db/document")
                    .set('x-access-token', token)
                    .send(user)

                res.should.have.status(200);
                res.body.owner.should.be.an("array");
                res.body.access.should.be.an("array");
                res.body.owner.length.should.be.equal(1);
                res.body.access.length.should.be.equal(0);
                res.body.owner[0].name.should.be.equal('New test');
                res.body.owner[0].html.should.be.equal('<p>New test</p>');
                res.body.owner[0].allowed_users.should.be.an("array");
                res.body.owner[0].allowed_users.length.should.be.equal(1);
                res.body.owner[0].date.length.should.be.equal(19);

                let credentials2 = {
                    email: 'testa@test.se',
                    password: "testa"
                };

                let resLogin = await chai.request(server)
                    .post("/auth/login")
                    .send(credentials2)

                resLogin.should.have.status(200);
                resLogin.body.token.should.not.equal(null);

                let tempToken = resLogin.body.token;
                let tempUserId = resLogin.body.userId;

                let user2 = {
                    _id: tempUserId
                }

                let res2 = await chai.request(server)
                    .post("/db/document")
                    .set('x-access-token', tempToken)
                    .send(user2)

                    res2.should.have.status(200);
                    res2.body.owner.should.be.an("array");
                    res2.body.access.should.be.an("array");
                    res2.body.owner.length.should.be.equal(0);
                    res2.body.access.length.should.be.equal(1);
                    res2.body.access[0].name.should.be.equal('New test');
                    res2.body.access[0].html.should.be.equal('<p>New test</p>');
                    res2.body.access[0].allowed_users.should.be.an("array");
                    res2.body.access[0].allowed_users.length.should.be.equal(1);
                    res2.body.access[0].date.length.should.be.equal(19);
                    res2.body.access[0].owner.should.be.equal(userId);
            });

            it('Delete document', async () => {
                let doc = {
                    _id: userId,
                    documentId: documentId
                };

                let res = await chai.request(server)
                    .delete("/db/document/delete")
                    .set('x-access-token', token)
                    .send(doc)

                res.should.have.status(204);
            });

            it('Get documents after delete, should be zero documents', async () => {
                user = {
                    _id: userId
                }

                res = await chai.request(server)
                    .post("/db/document")
                    .set('x-access-token', token)
                    .send(user)

                res.should.have.status(200);
                res.body.owner.should.be.an("array");
                res.body.access.should.be.an("array");
                res.body.owner.length.should.be.equal(0);
                res.body.access.length.should.be.equal(0);
            });
        })
    })





});
