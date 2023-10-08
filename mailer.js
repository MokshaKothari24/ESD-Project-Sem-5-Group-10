const express = require('express')
const nodemailer = require("nodemailer");

const app = express();

let port = 5000;
  
 

app.get('/', (req, res) => {
    res.send("I am a server");
});

const mail = async (req, res) => {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = await nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: 'virgie.flatley50@ethereal.email',
            pass: 'XpxpZuwtC7vEWtar2N'
        },
    });

    let info = await transporter.sendMail({
        from: '"Thakur Bank" <thakur@bank.org>', // sender address
        to: "abc@example.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
    res.json(info);
}

app.get('/mail', mail);

const start = async () => {
    try {
        app.listen(5000, () => {
            console.log(`App listening on port http://localhost:${port}`)
        })
    } catch(err) {

    }
}


start();