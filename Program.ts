/**
 * Entry point for the image server
 *
 * TODO : Error Handler quand le champ des images est pas present.
 * TODO  : Error handler pour les erreurs trop large
 */

import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

// Parse the .env of the project in the process runtime
dotenv.config();

const App = express();
const Host: string = process.env.HOST || "localhost";
const Port: number = process.env.PORT ? +process.env.PORT : 8080;

App.use(bodyParser.urlencoded({ extended: true }));

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



