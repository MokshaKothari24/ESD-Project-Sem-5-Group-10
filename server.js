const express = require("express");

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

async function displayRecord(req, res) {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log("Connected to the database");


        const db = client.db(dbName);

        const collection = db.collection("transaction");

        const { account } = req.body;
        filter = {
            accfrom: parseInt(account)
        }

        // Insert the document into the collection
        console.log("accfrom:", account);
        console.log("filter:", filter);

        const result = await collection.find(filter).toArray();


        res.json(result);
        console.log("Displayed document:", result);
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

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});