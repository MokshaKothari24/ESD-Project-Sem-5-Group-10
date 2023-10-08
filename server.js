const express = require("express");
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');
const cors = require("cors"); 

let generatedotp;

const app = express();
app.use(cors());

const port = 3000;

const { MongoClient } = require("mongodb");


const url = "mongodb://127.0.0.1:27017";
const dbName = "esdBank";

app.use(express.json());
app.use(express.urlencoded());

async function createDocument(req, res) {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log("Connected to the database");

        const db = client.db(dbName);

        const collection = db.collection('account');
        //Create user logic here

        const last_id = await collection.countDocuments();

        const { account, name, password, email, contact } = req.body;

        const newUser = {
            id: (last_id + 1),
            account: parseInt(account),
            name: name,
            password: password,
            email: email,
            contact: contact,
            balance: 1000
        }

        const result = await collection.insertOne(newUser);
        console.log("Created document:", result.insertedId);

        res.send(result.insertedId);

    } catch (err) {
        console.error("Error : ", err);
    } finally {
        await client.close();
        console.log("Disconnected from the database");
    }
}

async function readDocument(req, res) {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log("Connected to the database");

        const db = client.db(dbName);

        const collection = db.collection("account");

        // Insert the document into the collection
        const { name, password, otp } = req.body;
        filter = {
            name: name,
            password: password
        }
        if (otp === generatedotp) {
            // OTPs match, proceed with authentication logic
            // ...

            res.json(result);
        } else {
            // Invalid OTP
            res.json({ error: "Invalid OTP" });
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
        console.log("Disconnected from the database");
    }
}

async function updateAmount(senderAccount, receiverAccount, amount) {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log("Connected to the database");

        const db = client.db(dbName);
        const collection = db.collection("account");

        // Check if sender and receiver accounts exist
        const senderAccountNumber = parseInt(senderAccount);
        const receiverAccountNumber = parseInt(receiverAccount);

        const senderFilter = { account: senderAccountNumber };
        const receiverFilter = { account: receiverAccountNumber };

        const senderDoc = await collection.findOne(senderFilter);
        const receiverDoc = await collection.findOne(receiverFilter);

        if (!senderDoc || !receiverDoc) {
            throw new Error("Sender or receiver account not found");
        }

        // Check if sender has enough balance
        if (parseInt(senderDoc.balance) >= 900) {
            // Calculate updated balances
            const senderBalanceAfterTransfer = senderDoc.balance - amount;
            const receiverBalanceAfterTransfer = parseInt(receiverDoc.balance) + parseInt(amount);

            // Update sender's balance
            const senderUpdate = {
                $set: { balance: senderBalanceAfterTransfer }
            };
            await collection.updateOne(senderFilter, senderUpdate);

            // Update receiver's balance
            const receiverUpdate = {
                $set: { balance: receiverBalanceAfterTransfer }
            };
            await collection.updateOne(receiverFilter, receiverUpdate);

            // Insert transaction records into the 'transaction' collection
            const transactionCollection = db.collection("transaction");

            // Create transaction records for sender and receiver
            const senderTransaction = {
                accfrom: senderAccountNumber,
                accto: receiverAccountNumber,
                amt: -amount, // Negative amount for sender
                balance: senderBalanceAfterTransfer
            };

            const receiverTransaction = {
                accfrom: senderAccountNumber,
                accto: receiverAccountNumber,
                amt: parseInt(amount), // Positive amount for receiver
                balance: receiverBalanceAfterTransfer
            };

            // Insert sender and receiver transactions
            await transactionCollection.insertOne(senderTransaction);
            await transactionCollection.insertOne(receiverTransaction);

            console.log(`Updated balances for sender (${senderAccount}) and receiver (${receiverAccount})`);
        } else {
            throw new Error("Sender does not have enough balance");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
        console.log("Disconnected from the database");
    }
}

async function displayRecord(req, res) {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log("Connected to the database");

        const db = client.db(dbName);
        const collection = db.collection("transaction");

        const { account } = req.body;
        const filter = {
            $or: [{ accfrom: parseInt(account) }]
        }

        const result = await collection.find(filter).toArray();
        console.log("Displayed document:", result);

        res.json(result);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
        console.log("Disconnected from the database");
    }
}

async function deleteDocument(req) {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log("Connected to the database");

        const db = client.db(dbName);

        const collection = db.collection("account");

        const { name, password } = req.body;

        // Create a new document
        const delAccount = {
            name: name,
            password: password
        };

        // Insert the document into the collection
        const result = await collection.deleteOne(delAccount);
        console.log(result);
        console.log("Deleted document:", result.deletedCount);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
        console.log("Disconnected from the database");
    }
}

function otpGenerator() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function authenticate(req, res) {
    
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log("Connected to the database");
        
        const db = client.db(dbName);
        
        const collection = db.collection("account");
        const generatedotp = otpGenerator(); // Generate a new OTP for each authentication

        // Insert the document into the collection
        const { name, password, email } = req.body;
        filter = {
            name: name,
            password: password,
            email: email
        }
        const result = await collection.findOne(filter);

        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            auth: {
                user: 'virgie.flatley50@ethereal.email',
                pass: 'XpxpZuwtC7vEWtar2N',
            },
        });
    
        // Email configuration
        const info = await transporter.sendMail({
            from: '"Thakur Bank" <thakur@bank.org>',
            to: result.email, // Use the recipient's email from the database
            subject: "Your OTP for Thakur Bank",
            text: `Your OTP is: ${generatedotp}`,
            html: `<b>Your OTP is:</b> <br><strong>${generatedotp}</strong>`,
        });
        // res.authenticate(result.email);
        console.log(`${name} and ${password}`)
        res.send(generatedotp)
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
        console.log("Disconnected from the database");
    }
    // Create a transporter with your SMTP settings
    

    // console.log("Message sent: %s", info.messageId);
    return generatedotp; // Return the OTP for further verification
}

function generateAccountStatement(transactions, fileName, callback) {
    const doc = new PDFDocument();
    const outputStream = fs.createWriteStream(fileName);

    doc.pipe(outputStream);

    // Set PDF metadata
    doc.info.Title = 'Account Statement';
    doc.info.Author = 'Thakur Bank';

    // Add a title to the document
    doc.fontSize(18).text('Thakur Bank', { align: 'center' });
    doc.fontSize(18).text('Account Statement', { align: 'center' });
    doc.moveDown();

    // Iterate through transactions and add them to the document
    transactions.forEach((transaction, index) => {
        doc.fontSize(12).text(`Transaction ${index + 1}`, { underline: true });
        doc.fontSize(10).text(`Account From: ${transaction.accfrom}`);
        doc.text(`Account To: ${transaction.accto}`);
        doc.text(`Amount: ${transaction.amt}`);
        doc.text(`Balance: ${transaction.balance}`);
        doc.moveDown();
    });

    // Finalize the PDF
    doc.end();

    outputStream.on('finish', () => {
        console.log('PDF generated successfully');
        callback(null, 'PDF generated successfully'); // Call the callback with success message
    });

    outputStream.on('error', (err) => {
        console.error('Error generating PDF:', err);
        callback(err, 'Error generating PDF.'); // Call the callback with error message
    });
}





app.get("/", (req, res) => {
    res.sendFile(__dirname + '/home.html');
});

app.post("/register", (req, res) => {
    createDocument(req, res);
    // res.send("Registration Successful");
});

app.post("/login", (req, res) => {
    readDocument(req, res);
});

app.post('/verify', (req, res) => {
    authenticate(req, res)
})

// app.get('/mail', (req, res) => {
//     authenticate(req, res);
// });

app.post('/statement', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log("Connected to the database");

        const db = client.db(dbName);
        const collection = db.collection("transaction");

        const { account } = req.body;
        const filter = {
            $or: [{ accfrom: parseInt(account) }, { accto: parseInt(account) }]
        }

        const result = await collection.find(filter).toArray();
        console.log("Displayed document:", result);
        const filePath = path.join(__dirname, `account_statement.pdf`);

        // Call the modified generateAccountStatement function with a callback
        generateAccountStatement(result, filePath, (err, message) => {
            if (err) {
                console.error('PDF generation failed:', err);
                res.status(500).send('PDF generation failed');
            } else {
                console.log(message);
                res.download(filePath, 'account_statement.pdf', (downloadErr) => {
                    if (downloadErr) {
                        console.error('Error while sending the file:', downloadErr);
                        res.status(500).send('Error while sending the file');
                    }
                });
            }
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send('Error');
    } finally {
        await client.close();
        console.log("Disconnected from the database");
    }
});


app.post("/history", (req, res) => {
    displayRecord(req, res);
});

app.post("/transfer", (req, res) => {
    const { senderAccount, receiverAccount, amount } = req.body; // Extract data from request body

    if (!senderAccount || !receiverAccount || !amount) {
        return res.status(400).json({ error: "Invalid request data" });
    }

    updateAmount(senderAccount, receiverAccount, amount)
        .then(() => {
            res.json({ message: "Transfer successful" });
        })
        .catch((err) => {
            res.status(500).json({ error: "Internal Server Error" });
        });
});

// Route to schedule a transaction
app.post("/schedule-transaction", (req, res) => {
    const { senderAccount, receiverAccount, amount, scheduledTime } = req.body;

    if (!senderAccount || !receiverAccount || !amount || !scheduledTime) {
        return res.status(400).json({ error: "Invalid request data" });
    }

    // Parse the scheduledTime as a JavaScript Date object
    const scheduledDate = new Date(scheduledTime);

    // Schedule the transaction
    const job = schedule.scheduleJob(scheduledDate, () => {
        // Perform the transaction when the scheduled time is reached
        updateAmount(senderAccount, receiverAccount, amount);

        // Respond to the client
        res.json({ message: "Transaction scheduled successfully" });
    });
});

app.post("/delete", (req, res) => {
    deleteDocument(req);
    res.send("Document has been Deleted");
});

app.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  });
  