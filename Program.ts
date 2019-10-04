/**
 * Entry point for the image server
 *
 * TODO : Error Handler quand le champ des images est pas present.
 * TODO  : Error handler pour les erreurs trop large
 */

import express from "express";
import fileParser from "./general/FileParser";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import multer from "multer";
import mongodb from "./general/MongoDb"; 

// Parse the .env of the project in the process runtime
dotenv.config();

const FileMiddleware : multer.Instance = fileParser.GetMiddleware();
const App = express();
const Host : string = process.env.HOST || "localhost";
const Port : number = process.env.PORT ? +process.env.PORT : 8080;  

App.use(bodyParser.urlencoded({ extended: true }));

App.post("/upload", FileMiddleware.single('image'), (req, res) => {
    const file = req.file;

    if (!file) {
        res.send("Erreur avec le fichier");
    } else {
        res.send(`${fileParser.PathToRoot}/${file.filename}`);
    }
});

App.post("/uploads", FileMiddleware.array('images'), (req, res) => {
    const files = req.files;

    if (!files) {
        res.send("Erreur avec le fichier");
    } else {
        res.send(`reussi`);
    }
});

App.get("/", (req, res) => {
    res.sendFile(__dirname + "/pages/upload.html");
});

App.listen(
    Port,
    Host,
    (err) => {
        if (err) {
            console.log("Can't start the server");
        } else {
            console.log(`Server started\nPORT : ${Port}\nHOST : ${Host}`);
        }
    });



