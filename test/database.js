/* global it describe beforeEach */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
// const HTMLParser = require('node-html-parser');

const server = require('../app.js');

chai.should();

const database = require("../db/database.js");
const collectionName = "docs";

chai.use(chaiHttp);

describe('db', () => {
    beforeEach(() => {
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

    it('Added document', (done) => {
        let doc = {
            name: "test",
            html: "<p>test</p>"
        };

        chai.request(server)
            .post("/db")
            .send(doc)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.an("object");
                res.body._id.should.be.an("string");

                let id = res.body._id;

                chai.request(server)
                    .get("/db")
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an("array");
                        res.body[0].date.should.be.an("string");
                        res.body[0].date.length.should.equal(19);
                        res.body[0].name.should.equal(doc.name);
                        res.body[0].html.should.equal(doc.html);
                        res.body[0]._id.should.equal(id);

                        done();
                    });
            });
    });

    it('Reset database', (done) => {
        chai.request(server)
            .get("/db/reset")
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an("array");
                res.body.length.should.equal(1);
                res.body[0].name.should.be.equal("reset");

                done();
            });
    });

    it('Update document', (done) => {
        let doc = {
            name: "test",
            html: "<p>test</p>"
        };
        let updateDoc = {
            name: "test2",
            html: "<p>test2</p>"
        };

        chai.request(server)
            .post("/db")
            .send(doc)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.an("object");
                res.body._id.should.be.an("string");

                let id = res.body._id;

                updateDoc._id = id;

                chai.request(server)
                    .get("/db")
                    .end((err, res) => {
                        // console.log(res.body);
                        res.should.have.status(200);
                        res.body.should.be.an("array");
                        res.body[0].date.should.be.an("string");
                        res.body[0].date.length.should.equal(19);
                        res.body[0].name.should.equal(doc.name);
                        res.body[0].html.should.equal(doc.html);
                        res.body[0]._id.should.equal(id);

                        chai.request(server)
                            .put("/db")
                            .send(updateDoc)
                            .end((err, res) => {
                                res.should.have.status(204);


                                chai.request(server)
                                    .get("/db")
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        res.body.should.be.an("array");
                                        res.body[0].date.should.be.an("string");
                                        res.body[0].date.length.should.equal(19);
                                        res.body[0].name.should.equal(updateDoc.name);
                                        res.body[0].html.should.equal(updateDoc.html);
                                        res.body[0]._id.should.equal(id);

                                        done();
                                    });
                            });
                    });
            });
    });

    it('Delete document', (done) => {
        let doc = {
            name: "test",
            html: "<p>test</p>"
        };
        let doc2 = {
            name: "test2",
            html: "<p>test2</p>"
        };

        chai.request(server)
            .post("/db")
            .send(doc)
            .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.an("object");
                res.body._id.should.be.an("string");

                let id = res.body._id;

                chai.request(server)
                    .post("/db")
                    .send(doc2)
                    .end((err, res) => {
                        res.should.have.status(201);
                        res.body.should.be.an("object");
                        res.body._id.should.be.an("string");

                        let id2 = res.body._id;

                        chai.request(server)
                            .delete("/db")
                            .send({ _id: id})
                            .end((err, res) => {
                                res.should.have.status(204);


                                chai.request(server)
                                    .get("/db")
                                    .end((err, res) => {
                                        res.should.have.status(200);
                                        res.body.should.be.an("array");
                                        res.body.length.should.equal(1);
                                        res.body[0].date.should.be.an("string");
                                        res.body[0].date.length.should.equal(19);
                                        res.body[0].name.should.equal(doc2.name);
                                        res.body[0].html.should.equal(doc2.html);
                                        res.body[0]._id.should.equal(id2);

                                        done();
                                    });
                            });
                    });
            });
    });
});
