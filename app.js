/**
 * Entry point for the image server
 *
 * TODO : Error Handler quand le champ des images est pas present.
 * TODO  : Error handler pour les erreurs trop large
 */

const express = require("express");
const fileParser = require("./FileParser.js");
const app = express();
const fileMiddleware = fileParser.GetMiddleware();
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/upload", fileMiddleware.single('image'), (req, res) => {
    const file = req.file;

    if (!file) {
        res.send("Erreur avec le fichier");
    } else {
        res.send(`${fileParser.rootImagesFolder}/${file.filename}`);
    }
});

app.post("/uploads", fileMiddleware.array('images'), (req, res) => {
    const files = req.files;

    if (!files) {
        res.send("Erreur avec le fichier");
    } else {
        res.send(`reussi`);
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



