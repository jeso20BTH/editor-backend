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

const ioserver = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST", "PUT"]
    }
});

chai.use(chaiHttp);

describe('Test the routes for the database.', (done) => {
    let token;
    let userId;
    let documentId;
    let db;
    let commentId

    describe('User handeling', () => {
        before(() => {
            return new Promise(async (resolve) => {
                db = await database.getDb();

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

        it('Added user', (done) => {
            let user = {
                email: 'test@test.se',
                name: "test",
                password: "test"
            };

            chai.request(server)
                .post("/auth/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.token.should.not.equal(null);
                    res.body.message.should.equal('Successful register!');

                    done();
                })
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
    })

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
                type: 'text',
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
            res.body.owner[0].type.should.be.equal('text');
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

        it('Give another user access to a document, that is not registered', async () => {
            let doc = {
                _id: userId,
                documentId: documentId,
                allowed_users: 'testar@test.se'
            }

            let res = await chai.request(server)
                .put("/db/document/update")
                .set('x-access-token', token)
                .send(doc)


            res.should.have.status(204);
        });

        it('Get documents after invitedUser', async () => {
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
            res.body.owner[0].invited_users.should.be.an("array");
            res.body.owner[0].invited_users.length.should.be.equal(1);
            res.body.owner[0].invited_users[0].email.should.be.equal('testar@test.se');
            res.body.owner[0].date.length.should.be.equal(19);
        });
    });

    describe('Invited user handeling', () => {
        it('Added user invited to document', async () => {
            let user = {
                email: 'testar@test.se',
                name: "testar",
                password: "testar"
            };

            let res = await chai.request(server)
                .post("/auth/register")
                .send(user)

            res.should.have.status(201);
            res.body.token.should.not.equal(null);
            res.body.message.should.equal('Successful register!');
        });

        it('Get documents after invited user is registered', async () => {
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
            res.body.owner[0].allowed_users.length.should.be.equal(2);
            res.body.owner[0].date.length.should.be.equal(19);

            let credentials2 = {
                email: 'testar@test.se',
                password: "testar"
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

            res.body.owner[0].allowed_users[1]._id.should.be.equal(tempUserId);
            res2.should.have.status(200);
            res2.body.owner.should.be.an("array");
            res2.body.access.should.be.an("array");
            res2.body.owner.length.should.be.equal(0);
            res2.body.access.length.should.be.equal(1);
            res2.body.access[0].name.should.be.equal('New test');
            res2.body.access[0].html.should.be.equal('<p>New test</p>');
            res2.body.access[0].allowed_users.should.be.an("array");
            res2.body.access[0].allowed_users.length.should.be.equal(2);
            res2.body.access[0].date.length.should.be.equal(19);
            res2.body.access[0].owner.should.be.equal(userId);
        });
    });

    describe('Comment handeling', () => {
        it('Add comment', async () => {
            let body = {
                _id: userId,
                documentId: documentId,
                comment: {
                    number: 1,
                    text: 'test comment',
                    user: 'test',
                    crud: 'add'
                }
            };

            let res = await chai.request(server)
                .put("/db/document/update")
                .set('x-access-token', token)
                .send(body)

            res.should.have.status(204);
        });
        it('Check if comment is added to document', async () => {
            let body = {
                _id: userId
            };

            let res = await chai.request(server)
                .post("/db/document")
                .set('x-access-token', token)
                .send(body)

            commentId = res.body.owner[0].comments[0]._id;

            res.should.have.status(200);
            res.body.owner[0].name.should.be.equal('New test');
            res.body.owner[0].comments.should.be.an("array");
            res.body.owner[0].comments.length.should.be.equal(1);
            res.body.owner[0].comments[0].number.should.be.equal(1);
            res.body.owner[0].comments[0].text.should.be.equal('test comment');
            res.body.owner[0].comments[0].user.should.be.equal('test');
            res.body.owner[0].comments[0]._id.should.be.an('string');
            res.body.owner[0].comments[0].time.length.should.be.equal(19);
        });

        it('Update comment', async () => {
            let body = {
                _id: userId,
                documentId: documentId,
                comment: {
                    _id: commentId,
                    text: 'updated test comment.',
                    user: 'test',
                    crud: 'update'
                }
            };

            let res = await chai.request(server)
            .put("/db/document/update")
            .set('x-access-token', token)
            .send(body)

            res.should.have.status(204);
        });

        it('Check if comment is updated', async () => {
            let body = {
                _id: userId
            };

            let res = await chai.request(server)
            .post("/db/document")
            .set('x-access-token', token)
            .send(body)

            commentId = res.body.owner[0].comments[0]._id;

            res.should.have.status(200);
            res.body.owner[0].comments[0].text.should.be.equal('updated test comment.');
        });

        it('Delete comment', async () => {
            let body = {
                _id: userId,
                documentId: documentId,
                comment: {
                    _id: commentId,
                    crud: 'delete'
                }
            };

            let res = await chai.request(server)
                .put("/db/document/update")
                .set('x-access-token', token)
                .send(body)

            res.should.have.status(204);
        });
        it('Check if comment is deleted from document', async () => {
            let body = {
                _id: userId
            };

            let res = await chai.request(server)
                .post("/db/document")
                .set('x-access-token', token)
                .send(body)

            res.should.have.status(200);
            res.body.owner[0].comments.should.be.an("array");
            res.body.owner[0].comments.length.should.be.equal(0);
        });

    });

    describe('PDF handeling', () => {
        it('generate PDF', async () => {
            let doc = {
                title: 'test',
                html: "<p>test</p>"
            };

            let res = await chai.request(server)
                .post("/pdf")
                .set('x-access-token', token)
                .send(doc)

            res.should.have.status(200);
            res.header['content-disposition'].should.include('result.pdf')
            res.header['content-type'].should.equal('application/pdf')
            parseInt(res.header['content-length']).should.be.greaterThan(0)
            // res.body.message.should.equal('Successful register!');
        });
    });

    describe('Document handeling', () => {
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

        it('Get documents after delete, should be zero documents', (done) => {
            user = {
                _id: userId
            }

            chai.request(server)
                .post("/db/document")
                .set('x-access-token', token)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.owner.should.be.an("array");
                    res.body.access.should.be.an("array");
                    res.body.owner.length.should.be.equal(0);
                    res.body.access.length.should.be.equal(0);

                    done();
                })
        });
    });
});
