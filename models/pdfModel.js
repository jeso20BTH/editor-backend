const ObjectId = require('mongodb').ObjectId;
const puppeteer = require("puppeteer");
var path = require('path');


let database = require('./../db/database');

const pdfModel = {
    generatePDF: async (req, res) => {
        let title = req.body.title;
        let html = req.body.html;

        const browser = await puppeteer.launch({headless: true, args:['--no-sandbox', '--disable-setuid-sandbox']});
        // const browser = await puppeteer.connect({
        //   browserWSEndpoint: 'wss://chrome.browserless.io/'
        // });
        const page = await browser.newPage();

        await page.setContent(html);

        const pdfBuffer = await page.pdf({
            path: `${__dirname}/../files/result.pdf`,
            format: 'A4' ,
            margin: {
                top: '2cm',
                right: '1cm',
                bottom: '2cm',
                left: '1cm'
            }
        });



        var file = path.join(`${__dirname}/../files`, `result.pdf`);
        res.download(file, function (err) {
               if (err) {
                   console.log("Error");
                   console.log(err);
               }
        });
    },
    // sendPDF: (req, res) => {
    //     res.sendFile(`${__dirname}/../files/result.pdf`)
    // }
}


module.exports = pdfModel;
