/**
 * Entry point for the image server
 */

const express = require("express");
const app = express();
const upload = require("./uploadHandler.js");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/upload", upload.single('myFile'), (req, res) => {
    const file = req.file;

    if (!file) {
        res.send("Erreur avec le fichier");
    } else {
        res.send(file.destination);
    }
});

app.post("/uploads", upload.single('myFile'), (req, res) => {
    const file = req.file;

    if (!file) {
        res.send("Erreur avec le fichier");
    } else {
        res.send(file.destination);
    }
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/upload.html");
});

app.listen(
    process.env.PORT,
    process.env.HOST,
    (err) => {
        if (err) {
            console.log("Can't start the server");
        } else {
            console.log(`Server started\nPORT : ${process.env.PORT}\nIP : ${process.env.HOST}`);
        }
    });



