require('dotenv').config();
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

let config;

try {
    config = require('./../db/config.json');
} catch (e) {
    console.log(e);
}

configKey = config.sendgridapi;
fromEmail = config.fromemail;

sgMail.setApiKey(configKey);

const mailModel = {
    sendMail: async (req, res) => {

        const msg = {
              to: req.body.to, // Change to your recipient
              from: fromEmail, // Change to your verified sender
              subject: `${req.body.user.charAt(0).toUpperCase() + req.body.user.slice(1)} wants you to have access to document ${req.body.title}`,
              html: `
                <p>Dear user,</p>
                <p>You have been granted access to document ${req.body.title}.</p>
                <p>
                    If you already are a member login using the following link
                    <a href="${req.body.server}/login?email=${req.body.to}">
                        LOGIN
                    </a>
                .</p>
                <p>
                    If you are not a member please register using the following link
                    <a href="${req.body.server}/register?email=${req.body.to}">
                        REGISTER
                    </a>
                .</p>
            `,
            }
            sgMail
              .send(msg)
              .then(() => {
                res.status(200).json({
                    status: 'Message succesfully sent',
                })
              })
              .catch((error) => {
                  res.status(500).json({
                      status: 'Message didn´t send',
                  })
              })
    }

}

module.exports = mailModel;
