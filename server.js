const express = require('express');
const fs = require('fs');
const app = express();
const request = require('request-promise');
const schedule = require('node-schedule');
const nodemailer = require("nodemailer");
const _ = require('lodash');


const obj = JSON.parse(fs.readFileSync('endpoints.json', 'utf8'));
const result = [];

//Requests
app.use(express.json());

app.get('/', function (req, res) {
  res.send(obj);
});

app.post('/save', function (req, res) {
  res.json({requestBody: req.body});
});


async function makeRequest() {
  for (let i = 0; i < obj.endpoints.length; i++) {
    const tempData = {};
    try {
      await request.get(obj.endpoints[i].url, function (err, res, body) {
        if (res !== undefined) {
          tempData.statusCode = res.statusCode;

          if (res.headers['content-type'] !== "text/html") {
            JSON.parse(res.body).length === obj.endpoints[i].data_length ? tempData.isEqualLength = true : tempData.isEqualLength = false;

            _.isEqual(JSON.parse(res.body), JSON.parse(obj.endpoints[i].expected)) ? tempData.isEqualJson = true : tempData.isEqualJson = false;
          }

          result.push(tempData);
        }
      });
    } catch (e) {
      console.error(e);
      result.push(e);
    }
  }

  sendMail().catch(console.error);
}

// schedule.scheduleJob({hour: 16, minute: 52}, function () {
//   makeRequest();
// });
// setInterval(function () {
//   makeRequest();
// }, 50000);

// Send Mail
async function sendMail() {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'mert.akel@sirenbilisim.com.tr', // generated ethereal user
      pass: '' // generated ethereal password
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: 'mert.akel@sirenbilisim.com.tr', // sender address
    to: "akelmert95@gmail.com", // list of receivers
    subject: "Health Checker Info", // Subject line
    text: "Result \n" + JSON.stringify(result),
  };

  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions)

  console.log("Message sent: %s", info.messageId);
}


const server = app.listen(8081, function () {
  const host = server.address().address
  const port = server.address().port

  console.log("App is listening at http://%s:%s", host, port)
});
