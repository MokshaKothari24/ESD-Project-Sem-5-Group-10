const express = require("express");
const schedule = require('node-schedule');

const app = express();

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
        const { name, password } = req.body;
        filter = {
            name: name,
            password: password
        }
        const result = await collection.findOne(filter);
        console.log(`${name} and ${password}`)

        res.json(result);
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
            $or: [{ accfrom: parseInt(account) }, { accto: parseInt(account) }]
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



app.get("/", (req, res) => {
    res.send("Hello");
});

app.post("/register", (req, res) => {
    createDocument(req, res);
    // res.send("Registration Successful");
});

app.post("/login", (req, res) => {
    readDocument(req, res);
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


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});