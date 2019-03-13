const express = require('express');
const fs = require('fs');
const app = express();
const request = require('request-promise');
const schedule = require('node-schedule');
const nodemailer = require("nodemailer");
const _ = require('lodash');
const util = require('util');
const cors = require('cors')
let counter = 0;

let success = [];
let errors = [];

//Requests
app.use(express.json({limit: '50mb'}));
app.use(cors());

app.get('/', function (req, res) {
  const obj = JSON.parse(fs.readFileSync('endpoints.json', 'utf8'));
  res.send(obj);
});

app.get('/getLogs', function (req, res) {
  const data = fs.readFileSync('logs.json');
  data != null ? res.send(JSON.parse(data)) : res.status(500).send('No value present!');
});

app.get('/checkLogs', function (req, res) {
  if (makeRequest()) {
    res.status(200).json({status: "ok"});
  } else {
    res.status(500).send('An error occured!');
  }
});

app.post('/create', function (req, res) {
  const temObj = {};
  temObj.url = req.body.url;
  temObj.data_length = req.body.data_length;
  temObj.expected_output = req.body.expected_output;


  try {
    // Read file
    const rawdata = fs.readFileSync('endpoints.json');
    const endpoints = JSON.parse(rawdata).endpoints;
    endpoints.push(temObj);
    const lastObject = {};
    lastObject.endpoints = endpoints;
    // Delete file
    // fs.unlinkSync('endpoints.json');

    fs.unlink('endpoints.json', function (err) {
      if (err && err.code == 'ENOENT') {
        console.info("File doesn't exist, won't remove it.");
        res.status(500).send('An error occured!');
      } else if (err) {
        res.status(500).send('An error occured!');
      } else {
        // Create the file
        fs.writeFile('endpoints.json', JSON.stringify(lastObject, null, ' '), (err) => {
          if (err) throw err;
        });
        res.status(200).json({status: "ok", message: "Saved successfully!"});
      }
    });

  } catch (e) {
    res.status(500).send('An error occured!');
  }
});


async function makeRequest() {
  const obj = JSON.parse(fs.readFileSync('endpoints.json', 'utf8'));
  success = [];
  errors = [];
  for (let i = 0; i < obj.endpoints.length; i++) {
    const tempData = {};
    try {
      await request.get(obj.endpoints[i].url, function (err, res, body) {
        if (res !== undefined && !err) {
          tempData.statusCode = res.statusCode;

          tempData.link_url = obj.endpoints[i].url;

          if (!res.headers['content-type'].includes("text/html")) {
            JSON.parse(res.body).length === obj.endpoints[i].data_length ? tempData.isEqualLength = true : tempData.isEqualLength = false;

            _.isEqual(JSON.parse(res.body), JSON.parse(obj.endpoints[i].expected_output)) ? tempData.isEqualJson = true : tempData.isEqualJson = false;
          } else {
            tempData.isEqualLength = 'No data';
            tempData.isEqualJson = 'No data';
          }

          success.push(tempData);
        }
      });
    } catch (e) {
      counter++;
      errors.push(e);
      counter < 2 ? sendMail().catch(console.error) : '';
    }
  }

  if (errors.length === 0) {
    counter = 0;
  }

  // fs.unlinkSync('logs.json');

  fs.unlink('logs.json', function (err) {
    if (err && err.code == 'ENOENT') {
      console.info("File doesn't exist, won't remove it.");
    } else if (err) {
      console.error("Error occurred while trying to remove file");
    } else {
      const result = success.concat(errors);

      fs.writeFile('logs.json', JSON.stringify(result, null, ' '), (err) => {
        if (err) throw err;
      });
      return true;
    }
  });
}

setInterval(function () {
  makeRequest();
}, 300000);

// setInterval(function () {
//   makeRequest();
// }, 50000);

// Send Mail
async function sendMail() {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: 'mert.akel@sirenbilisim.com.tr',
      pass: 'siren2010'
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: 'mert.akel@sirenbilisim.com.tr', // sender address
    to: "akelmert95@gmail.com", // list of receivers
    subject: "Health Checker Error", // Subject line
    text: "Error \n" + JSON.stringify(errors),
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
