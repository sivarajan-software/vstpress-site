/* eslint-disable no-unused-vars */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {google} = require("googleapis");
const nodemailer = require("nodemailer");
admin.initializeApp();

const CLIENT_ID = functions.config().auth.client_id;
const CLIENT_SECRET = functions.config().auth.client_secret;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = "1//04EnawiIjkV6bCgYIARAAGAQSNwF-L9IrWD5m8r4Jwts-AtrjKOhIf0MN_6akgYubISgIG9NErziu_Y85Qvgfh-gj6vFT46CVS5U";

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

async function sendNodemailer(input) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "sivarajan.software@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailBody =
    "Name: " + input.name + "\n"+
    "Phone: " + input.phone + "\n" +
    "Email: " + input.email + "\n" +
    "Message: " + input.message;

    const mailOptions = {
      from: "sivarajan.software@gmail.com",
      to: "sivarajan.software@gmail.com",
      subject: "hello from gmail using firebase",
      text: mailBody,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

exports.sendMail = functions.https.onRequest((req, res) => {
  const input = {
    "name": req.body.name,
    "phone": req.body.phone,
    "email": req.body.email,
    "message": req.body.message,
  };

  sendNodemailer(input).then(() => {
    console.log("Email Sent");
    res.redirect("/enquiry-submission");
  }).catch((err) => {
    console.log("Error Occurred: " + err);
    res.status(500).send("Error Occurred: " + err);
  });
});
