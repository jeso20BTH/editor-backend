const axios = require('axios');

const btoa = (text) => {
    return Buffer.from(text, 'binary').toString('base64');
};

const abot = (text) => {
    return Buffer.from(text, 'base64').toString('binary');
};

const codeModel = {
    runCode: async (req, res) => {

        let data = {
            code: btoa(req.body.code)
        };

        let result = await axios.post("https://execjs.emilfolino.se/code",
            JSON.stringify(data),
            {
                headers: {
                    'content-type': 'application/json'
                }
            }
        )

        let decodedOutput = abot(result.data.data);

        res.json({output: decodedOutput})
    }
}


module.exports = codeModel;
